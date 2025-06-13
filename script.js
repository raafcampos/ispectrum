document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('#navbar a'); // Seleciona todos os links da navegação

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Alterna a exibição do menu para dispositivos móveis
            const isMenuOpen = header.classList.contains('open');
            if (isMenuOpen) {
                header.classList.remove('open');
                navbar.style.display = 'none';
                menuToggle.setAttribute('aria-expanded', 'false');
            } else {
                header.classList.add('open');
                navbar.style.display = 'block';
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    // Fechar o menu ao clicar em um link (para mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) { // Verifica se está em tela mobile
                header.classList.remove('open');
                navbar.style.display = 'none';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Atualizar ano no rodapé automaticamente
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});