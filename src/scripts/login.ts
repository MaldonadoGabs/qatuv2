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

let tipoUsuarioLogin: TipoUsuario = 'comprador';

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const btnComprador = document.getElementById('btn-comprador');
    const btnVendedor = document.getElementById('btn-vendedor');
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    
    if (btnComprador) {
        btnComprador.addEventListener('click', () => seleccionarTipoUsuario('comprador'));
    }
    
    if (btnVendedor) {
        btnVendedor.addEventListener('click', () => seleccionarTipoUsuario('vendedor'));
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    }
});

function seleccionarTipoUsuario(tipo: TipoUsuario): void {
    tipoUsuarioLogin = tipo;
    
    const btnComprador = document.getElementById('btn-comprador');
    const btnVendedor = document.getElementById('btn-vendedor');
    
    if (btnComprador && btnVendedor) {
        if (tipo === 'comprador') {
            btnComprador.classList.add('active');
            btnVendedor.classList.remove('active');
        } else {
            btnVendedor.classList.add('active');
            btnComprador.classList.remove('active');
        }
    }
}

function manejarLogin(e: Event): void {
    e.preventDefault();
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    
    // Obtener usuarios registrados
    const usuariosJSON = localStorage.getItem('usuariosRegistrados');
    let usuarios: Usuario[] = [];
    
    if (usuariosJSON) {
        usuarios = JSON.parse(usuariosJSON);
    }
    
    // Agregar usuario predeterminado Qatu si no existe
    const vendedorQatu: Usuario = {
        tipo: 'vendedor',
        nombreEmpresa: 'Qatu',
        email: 'qatu@qatu.com',
        password: 'qatu'
    };
    
    const existeQatu = usuarios.some(u => u.email === 'qatu@qatu.com');
    if (!existeQatu) {
        usuarios.push(vendedorQatu);
    }
    
    // Buscar usuario
    const usuarioEncontrado = usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.tipo === tipoUsuarioLogin
    );
    
    if (usuarioEncontrado) {
        // Login exitoso
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        console.log('Login exitoso:', usuarioEncontrado);
        
        alert(`Bienvenido ${usuarioEncontrado.nombreEmpresa || usuarioEncontrado.nombre}!`);
        
        // Redirigir según tipo de usuario
        if (usuarioEncontrado.tipo === 'vendedor') {
            window.location.href = '/src/pages/dashboard-vendedor.html';
        } else {
            window.location.href = '/index.html';
        }
    } else {
        // Credenciales incorrectas
        alert(`Credenciales incorrectas o no existe una cuenta de ${tipoUsuarioLogin} con estos datos.\n\nPor favor, verifique:\n- El correo electrónico\n- La contraseña\n- Que esté seleccionando el tipo de cuenta correcto`);
    }
}

// Exportar para convertir en módulo
export {};
