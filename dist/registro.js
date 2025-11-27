let tipoUsuarioActual = 'comprador';
// Simular base de datos de usuarios
const usuariosRegistrados = [];
// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const btnComprador = document.getElementById('btn-comprador');
    const btnVendedor = document.getElementById('btn-vendedor');
    if (btnComprador) {
        btnComprador.addEventListener('click', () => seleccionarTipoUsuario('comprador'));
    }
    if (btnVendedor) {
        btnVendedor.addEventListener('click', () => seleccionarTipoUsuario('vendedor'));
    }
    // Configurar ambos formularios
    const formComprador = document.getElementById('form-comprador');
    const formVendedor = document.getElementById('form-vendedor');
    if (formComprador) {
        formComprador.addEventListener('submit', manejarEnvioFormulario);
    }
    if (formVendedor) {
        formVendedor.addEventListener('submit', manejarEnvioFormulario);
    }
    // Simular registro del vendedor Qatu
    simularRegistroVendedorQatu();
});
function seleccionarTipoUsuario(tipo) {
    tipoUsuarioActual = tipo;
    const btnComprador = document.getElementById('btn-comprador');
    const btnVendedor = document.getElementById('btn-vendedor');
    const formComprador = document.getElementById('form-comprador');
    const formVendedor = document.getElementById('form-vendedor');
    // Actualizar estado de los botones
    if (btnComprador && btnVendedor) {
        if (tipo === 'comprador') {
            btnComprador.classList.add('active');
            btnVendedor.classList.remove('active');
        }
        else {
            btnVendedor.classList.add('active');
            btnComprador.classList.remove('active');
        }
    }
    // Mostrar/ocultar formularios
    if (formComprador && formVendedor) {
        if (tipo === 'comprador') {
            formComprador.style.display = 'flex';
            formVendedor.style.display = 'none';
        }
        else {
            formComprador.style.display = 'none';
            formVendedor.style.display = 'flex';
        }
    }
}
function manejarEnvioFormulario(e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    e.preventDefault();
    const form = e.target;
    if (tipoUsuarioActual === 'comprador') {
        const nombre = (_a = form.querySelector('#nombre')) === null || _a === void 0 ? void 0 : _a.value;
        const apellido = (_b = form.querySelector('#apellido')) === null || _b === void 0 ? void 0 : _b.value;
        const email = (_c = form.querySelector('#email')) === null || _c === void 0 ? void 0 : _c.value;
        const password = (_d = form.querySelector('#password')) === null || _d === void 0 ? void 0 : _d.value;
        const confirmPassword = (_e = form.querySelector('#confirm-password')) === null || _e === void 0 ? void 0 : _e.value;
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        const nuevoUsuario = {
            tipo: 'comprador',
            nombre,
            apellido,
            email,
            password
        };
        registrarUsuario(nuevoUsuario);
    }
    else {
        const nombreEmpresa = (_f = form.querySelector('#nombre-empresa')) === null || _f === void 0 ? void 0 : _f.value;
        const email = (_g = form.querySelector('#email-vendedor')) === null || _g === void 0 ? void 0 : _g.value;
        const password = (_h = form.querySelector('#password-vendedor')) === null || _h === void 0 ? void 0 : _h.value;
        const confirmPassword = (_j = form.querySelector('#confirm-password-vendedor')) === null || _j === void 0 ? void 0 : _j.value;
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        const nuevoUsuario = {
            tipo: 'vendedor',
            nombreEmpresa,
            email,
            password
        };
        registrarUsuario(nuevoUsuario);
    }
}
function registrarUsuario(usuario) {
    usuariosRegistrados.push(usuario);
    // Guardar en localStorage todos los usuarios
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
    console.log('Usuario registrado exitosamente:', usuario);
    console.log('Total de usuarios registrados:', usuariosRegistrados.length);
    console.log('Lista completa de usuarios:', usuariosRegistrados);
    // Guardar sesión en localStorage
    localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
    alert(`¡Registro exitoso! Bienvenido ${usuario.nombreEmpresa || usuario.nombre}`);
    // Redirigir según el tipo de usuario
    if (usuario.tipo === 'vendedor') {
        window.location.href = '/src/pages/dashboard-vendedor.html';
    }
    else {
        window.location.href = '/index.html';
    }
}
function simularRegistroVendedorQatu() {
    const vendedorQatu = {
        tipo: 'vendedor',
        nombreEmpresa: 'Qatu',
        email: 'qatu@qatu.com',
        password: 'qatu'
    };
    usuariosRegistrados.push(vendedorQatu);
    // Guardar en localStorage
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
    console.log('Vendedor Qatu registrado automáticamente al cargar la página');
    console.log('Usuario registrado:', vendedorQatu);
}
// Exportar para convertir en módulo
export {};
//# sourceMappingURL=registro.js.map