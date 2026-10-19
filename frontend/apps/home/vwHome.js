
document.addEventListener('DOMContentLoaded', function () {

    const token = sessionStorage.getItem('tokenDW3');

    // Impede o acesso à página inicial sem autenticação.
    if (!token) {
        window.location.href = '/login';
        return;
    }

});
