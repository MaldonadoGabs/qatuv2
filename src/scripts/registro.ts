// Tipos de usuario
type TipoUsuario = 'comprador' | 'vendedor';

interface Usuario {
    tipo: TipoUsuario;
    email: string;
    password: string;
    nombreEmpresa?: string;
    nombre?: string;
    apellido?: string;
}

let tipoUsuarioActual: TipoUsuario = 'comprador';

// Simular base de datos de usuarios
const usuariosRegistrados: Usuario[] = [];

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
    const formComprador = document.getElementById('form-comprador') as HTMLFormElement;
    const formVendedor = document.getElementById('form-vendedor') as HTMLFormElement;
    
    if (formComprador) {
        formComprador.addEventListener('submit', manejarEnvioFormulario);
    }
    
    if (formVendedor) {
        formVendedor.addEventListener('submit', manejarEnvioFormulario);
    }
    
    // Simular registro del vendedor Qatu
    simularRegistroVendedorQatu();
});

function seleccionarTipoUsuario(tipo: TipoUsuario): void {
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
        } else {
            btnVendedor.classList.add('active');
            btnComprador.classList.remove('active');
        }
    }
    
    // Mostrar/ocultar formularios
    if (formComprador && formVendedor) {
        if (tipo === 'comprador') {
            formComprador.style.display = 'flex';
            formVendedor.style.display = 'none';
        } else {
            formComprador.style.display = 'none';
            formVendedor.style.display = 'flex';
        }
    }
}

function manejarEnvioFormulario(e: Event): void {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    
    if (tipoUsuarioActual === 'comprador') {
        const nombre = (form.querySelector('#nombre') as HTMLInputElement)?.value;
        const apellido = (form.querySelector('#apellido') as HTMLInputElement)?.value;
        const email = (form.querySelector('#email') as HTMLInputElement)?.value;
        const password = (form.querySelector('#password') as HTMLInputElement)?.value;
        const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement)?.value;
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        const nuevoUsuario: Usuario = {
            tipo: 'comprador',
            nombre,
            apellido,
            email,
            password
        };
        
        registrarUsuario(nuevoUsuario);
    } else {
        const nombreEmpresa = (form.querySelector('#nombre-empresa') as HTMLInputElement)?.value;
        const email = (form.querySelector('#email-vendedor') as HTMLInputElement)?.value;
        const password = (form.querySelector('#password-vendedor') as HTMLInputElement)?.value;
        const confirmPassword = (form.querySelector('#confirm-password-vendedor') as HTMLInputElement)?.value;
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        const nuevoUsuario: Usuario = {
            tipo: 'vendedor',
            nombreEmpresa,
            email,
            password
        };
        
        registrarUsuario(nuevoUsuario);
    }
}

function registrarUsuario(usuario: Usuario): void {
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
    } else {
        window.location.href = '/index.html';
    }
}

function simularRegistroVendedorQatu(): void {
    const vendedorQatu: Usuario = {
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
