// Navegación Dinámica SPA
function showPage(pageId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.classList.add('hidden'));

    // Remover estado activo de los enlaces
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // Mostrar la página seleccionada
    const activeSection = document.getElementById(`page-${pageId}`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    // Activar el enlace correspondiente
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Desplazar suavemente hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Menú Móvil Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

function toggleMobileMenu() {
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Envío del Formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Simulación de envío exitoso
    const modal = document.getElementById('modal-success');
    if (modal) {
        modal.classList.remove('hidden');
    }

    // Limpiar campos del formulario
    document.getElementById('contact-form').reset();
}

function closeModal() {
    const modal = document.getElementById('modal-success');
    if (modal) {
        modal.classList.add('hidden');
    }
}
