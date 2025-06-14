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
});