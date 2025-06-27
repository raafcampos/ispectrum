document.addEventListener('DOMContentLoaded', function() {
    // Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const header = document.getElementById('header'); // Para adicionar a classe 'open'

    if (menuToggle && header) {
        menuToggle.addEventListener('click', function() {
            header.classList.toggle('open');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Atualizar ano no rodapé
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Lógica para expandir/colapsar listas de serviços
    const serviceGridItems = document.querySelectorAll('#servicos .grid-item');

    serviceGridItems.forEach(item => {
        const list = item.querySelector('ul.service-list');
        const button = item.querySelector('.expand-list-button');
        const allListItems = list.querySelectorAll('li');

        if (allListItems.length <= 5) {
            button.style.display = 'none'; // Esconde o botão se não houver itens para expandir
        } else {
            list.classList.add('collapsed'); // Adiciona classe para colapsar por padrão via CSS
        }

        button.addEventListener('click', function() {
            const isExpanded = list.classList.contains('expanded');

            if (isExpanded) {
                list.classList.remove('expanded');
                list.classList.add('collapsed');
                this.setAttribute('aria-expanded', 'false');
                this.innerHTML = 'Ver mais <i class="fas fa-chevron-down"></i>';
            } else {
                list.classList.remove('collapsed');
                list.classList.add('expanded');
                this.setAttribute('aria-expanded', 'true');
                this.innerHTML = 'Ver menos <i class="fas fa-chevron-up"></i>';
            }
        });
    });

    // Lógica para o Carrossel de Notícias/Blog na página blog.html
    const blogCarouselTrack = document.querySelector('.blog-carousel-track');
    if (blogCarouselTrack) {
        const items = Array.from(blogCarouselTrack.children);
        const nextButton = document.querySelector('.blog-carousel-section .carousel-nav.next');
        const prevButton = document.querySelector('.blog-carousel-section .carousel-nav.prev');
        let itemWidth = 0; // Será calculado
        let currentIndex = 0;
        let itemsPerPage = 3; // Padrão para telas maiores

        function calculateItemsPerPage() {
            if (window.innerWidth <= 768) {
                itemsPerPage = 1;
            } else {
                itemsPerPage = 3; // Ou 2, dependendo do seu design
            }
            // Recalcula a largura do item se necessário, ou ajuste o CSS para ser responsivo
            itemWidth = items.length > 0 ? items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(items[0]).marginRight) : 0;
        }

        function updateCarousel() {
            if (!itemWidth && items.length > 0) calculateItemsPerPage(); // Calcula na primeira vez
            const offset = -currentIndex * itemWidth * (itemsPerPage === 1 ? 1 : 1/itemsPerPage) ; // Ajuste para múltiplos itens
            // Para um carrossel que mostra 'itemsPerPage' de uma vez:
            // A lógica de offset precisa ser mais sofisticada se os itens não tiverem largura fixa ou se itemsPerPage > 1
            // Esta é uma simplificação. Para um carrossel robusto, considere uma biblioteca.
            // Por agora, vamos focar em mover um "bloco" de itemsPerPage.
            // O CSS com flex: 0 0 calc(33.333% - 20px) já define a largura dos itens.
            // O JS precisa mover o track pelo tamanho de UM item visível.
            blogCarouselTrack.style.transform = `translateX(-${currentIndex * (items[0].offsetWidth + parseFloat(getComputedStyle(items[0]).marginRight))}px)`;
        }

        nextButton.addEventListener('click', () => {
            if (currentIndex < items.length - itemsPerPage) { // Não avança se os últimos itens já estão visíveis
                currentIndex++;
                updateCarousel();
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        window.addEventListener('resize', () => {
            calculateItemsPerPage();
            updateCarousel(); // Reajusta se a largura mudar
        });
        
        // Inicializa
        if(items.length > 0) calculateItemsPerPage();

    }

    // Lógica para animar números na seção de resultados (Big Numbers)
    const resultadosSection = document.getElementById('resultados');
    const destaqueItems = document.querySelectorAll('#resultados .destaque-item span');
    let animated = false; // Flag para garantir que a animação ocorra apenas uma vez

    function animateCountUp(element, target, prefix = '', suffix = '', duration = 4000) { // Duração padrão de 4 segundos
        const isFloat = Number.isFinite(target) && !Number.isInteger(target);
        const decimalPlaces = isFloat ? (target.toString().split('.')[1] || '').length : 0;
        let startTime = null;

        // Define o texto inicial para 0 com a formatação correta
        element.textContent = prefix + (0).toFixed(decimalPlaces).replace('.', ',') + suffix;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1); // Progress de 0 a 1
            let currentValue = progress * target;

            let displayValue;
            if (isFloat) {
                displayValue = currentValue.toFixed(decimalPlaces).replace('.', ',');
            } else {
                // Para inteiros, mostra o valor arredondado para baixo durante a animação
                displayValue = Math.floor(currentValue).toString();
            }
            element.textContent = prefix + displayValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Garante que o valor final seja exato e com a formatação correta
                element.textContent = prefix + target.toFixed(decimalPlaces).replace('.', ',') + suffix;
            }
        };
        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                destaqueItems.forEach(itemSpan => {
                    const fullText = itemSpan.textContent;
                    const match = fullText.match(/^([^\d,.-]*)([\d,.-]+)(.*)$/);
                    if (match) {
                        const prefix = match[1];
                        const numberStr = match[2].replace('.', '').replace(',', '.'); // Trata "1.000" e "1,05"
                        const targetValue = parseFloat(numberStr);
                        const suffix = match[3];
                        if (!isNaN(targetValue)) {
                            animateCountUp(itemSpan, targetValue, prefix, suffix);
                        }
                    }
                });
                animated = true; // Marcar como animado para não repetir
                observer.unobserve(resultadosSection); // Opcional: parar de observar após animar
            }
        });
    }, { threshold: 0.5 }); // Dispara quando 50% da seção está visível

    if (resultadosSection && destaqueItems.length > 0) {
        observer.observe(resultadosSection);
    }

    // --- Lógica para o Formulário de Diagnóstico (agora em sua própria página) ---
    const formDiagnostico = document.getElementById('form-diagnostico');

    const resultadoModal = document.getElementById('resultado-modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    if (formDiagnostico) {
        // Definição das perguntas, pesos e textos de resultado
        const perguntas = [
            { texto: 'Melhorias contínuas nos produtos ou serviços', peso: 1 },
            { texto: 'Adaptação para novos segmentos de mercado', peso: 1.5 },
            { texto: 'Investimento em ideias sem aplicação clara', peso: 2 },
            { texto: 'Foco na experiência dos clientes atuais', peso: 1 },
            { texto: 'Novas linhas de negócio com competências existentes', peso: 1.5 },
            { texto: 'Tempo e recursos para experimentação', peso: 2 },
            { texto: 'Foco em eficiência e redução de custos', peso: 1 },
            { texto: 'Parcerias ou tecnologias externas', peso: 1.5 },
            { texto: 'Liderança com visão de futuro transformador', peso: 2 },
            { texto: 'Planejamento estratégico', peso: 1 },
            { texto: 'Papéis e responsabilidades definidos', peso: 1 },
            { texto: 'Uso de indicadores (KPIs)', peso: 1 },
            { texto: 'Processos documentados', peso: 1 },
            { texto: 'Reuniões com base em dados', peso: 1 },
            { texto: 'Canal de escuta para colaboradores', peso: 1 }
        ];

        const introMessage = `<p class="modal-intro-text"><strong>Parabéns por concluir o diagnóstico!</strong> Sua iniciativa demonstra um compromisso real com a evolução da sua empresa e uma vontade genuína de aprimorar seus processos para alcançar novos patamares. Veja abaixo onde sua empresa se posiciona no mapa da inovação:</p>`;
        const ctaButton = `<div class="modal-cta-container"><a href="https://wa.me/5545999265767?text=Ol%C3%A1%2C%20fiz%20o%20diagn%C3%B3stico%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20os%20pr%C3%B3ximos%20passos." class="modal-cta-button" target="_blank" rel="noopener noreferrer">Fale com um Especialista</a></div>`;

        const resultadoHTML = {
            H1: `${introMessage}
                <h3 class="h1-title">🟢 Horizonte 1 — Foco na Excelência Operacional e Inovação Incremental</h3>
                <p>A análise indica que sua empresa atua predominantemente no <strong>Horizonte 1</strong>, concentrando esforços na <strong>melhoria contínua</strong> de produtos, serviços e processos já existentes. Esse posicionamento é caracterizado por uma forte orientação à <strong>eficiência operacional</strong>, redução de custos e manutenção da competitividade. Trata-se de uma base <strong>fundamental e sólida</strong> para garantir estabilidade e resultados consistentes no curto prazo.</p>
                <p>Para garantir a <strong>relevância futura</strong>, o desafio agora é começar a estruturar mecanismos para <strong>explorar novas oportunidades</strong> e testar abordagens alternativas, abrindo espaço para estratégias que tragam uma diferenciação sustentável no mercado.</p>
                ${ctaButton}`,
            H2: `${introMessage}
                <h3 class="h2-title">🟡 Horizonte 2 — Expansão Estratégica e Inovação Adjacente</h3>
                <p>Os resultados apontam que sua empresa opera com predominância no <strong>Horizonte 2</strong>, o que revela uma excelente disposição para explorar <strong>novas aplicações</strong> das competências já consolidadas. Esse estágio é caracterizado pela busca por <strong>novos mercados, canais ou segmentos</strong>, utilizando o que a empresa já sabe fazer bem. Trata-se de um movimento estratégico que amplia o alcance do negócio com <strong>risco calculado</strong>.</p>
                <p>Empresas nesse horizonte estão em uma transição decisiva. O próximo passo é fortalecer uma <strong>cultura de inovação</strong> mais ampla, envolvendo metodologias, parceiros estratégicos e uma governança que sustente essa expansão, preparando a organização para lidar com incertezas e iniciativas de <strong>maior impacto</strong>.</p>
                ${ctaButton}`,
            H3: `${introMessage}
                <h3 class="h3-title">🔵 Horizonte 3 — Liderança de Mercado e Inovação Transformacional</h3>
                <p>Sua empresa demonstra um forte alinhamento com o <strong>Horizonte 3</strong>, evidenciando uma atuação orientada à <strong>transformação profunda</strong> e à criação de <strong>novos modelos de negócio</strong>. Essa posição é característica de organizações visionárias, que investem em soluções disruptivas e ideias que <strong>rompem com o status quo</strong>. É uma abordagem ousada, essencial para quem busca <strong>protagonismo e liderança</strong> em mercados de rápida evolução.</p>
                <p>Esse horizonte exige visão estratégica, tolerância ao risco e um ecossistema interno preparado para <strong>aprender e experimentar continuamente</strong>. Para sustentar essa vanguarda, é fundamental ter processos de experimentação estruturados e apoio consistente da liderança. O desafio não é apenas inovar, mas <strong>transformar a inovação</strong> em valor real e sustentável.</p>
                ${ctaButton}`
        };

        formDiagnostico.addEventListener('submit', async function(event) {
            event.preventDefault();

            // --- 1. Cálculo do Resultado ---
            let notaTotal = 0;
            const respostas = [];

            // Coleta as respostas dos radio buttons e valida se todas foram respondidas
            for (let i = 0; i < perguntas.length; i++) {
                const perguntaName = `q${i + 3}`; // Nomes das perguntas vão de q3 a q17
                const respostaSelecionada = formDiagnostico.querySelector(`input[name="${perguntaName}"]:checked`);
                if (!respostaSelecionada) {
                    alert(`Por favor, responda à pergunta ${i + 1}.`);
                    return; // Interrompe se alguma pergunta não foi respondida
                }
                const valorResposta = parseInt(respostaSelecionada.value.split('-')[0]);
                respostas.push(valorResposta);
                notaTotal += valorResposta * perguntas[i].peso;
            }

            // Definição dos limites para cada horizonte
            const notaMinima = perguntas.reduce((soma, p) => soma + 1 * p.peso, 0);
            const notaMaxima = perguntas.reduce((soma, p) => soma + 5 * p.peso, 0);
            const faixa1 = notaMinima + (notaMaxima - notaMinima) / 3;
            const faixa2 = notaMinima + 2 * (notaMaxima - notaMinima) / 3;

            let horizonte;
            if (notaTotal <= faixa1) horizonte = "H1";
            else if (notaTotal <= faixa2) horizonte = "H2";
            else horizonte = "H3";

            // --- 2. Exibição do Resultado no Modal ---
            modalBody.innerHTML = resultadoHTML[horizonte];
            resultadoModal.style.display = "block"; // Mostra o modal

            // Limpa o formulário imediatamente após o cálculo e antes do envio assíncrono
            formDiagnostico.reset();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll para o topo para ver o modal
            
            // --- 3. Envio dos dados para o Formspree (em segundo plano) ---
            const status = document.getElementById('quiz-status');
            const submitButton = document.getElementById('quiz-submit-btn');
            const data = new FormData(event.target);

            submitButton.disabled = true;
            submitButton.textContent = "Enviado!";
            status.innerHTML = "Diagnóstico gerado. Enviando uma cópia para seu e-mail...";
            status.style.color = 'var(--text-color)';

            try {
                const response = await fetch(event.target.action, {
                    method: formDiagnostico.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    status.innerHTML = "Seu diagnóstico foi gerado acima. Uma cópia foi enviada com sucesso para nosso time.";
                    status.style.color = 'var(--green-color)';
                } else {
                    status.innerHTML = "Oops! Houve um problema ao enviar a cópia do seu formulário.";
                    status.style.color = 'var(--primary-color)';
                }
            } catch (error) {
                status.innerHTML = "Oops! Houve um problema de conexão ao enviar a cópia.";
                status.style.color = 'var(--primary-color)';
            }
        });
    }

});