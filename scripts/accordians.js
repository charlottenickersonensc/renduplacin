document.querySelectorAll('.accordion-trigger').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        const isOpen = accordionItem.classList.contains('active');
        
        // Close all accordion items
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.accordion-icon').textContent = '+';
        });
    
        // Open clicked item if it wasn't already open
        if (!isOpen) {
            accordionItem.classList.add('active');
            button.querySelector('.accordion-icon').textContent = '−';
        }
    });
    });

function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('active');
}