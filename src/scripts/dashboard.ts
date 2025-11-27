// Carrusel de productos
let posicionActual: number = 0;
let carrusel: HTMLElement | null;
let totalProductos: number;
const productosPorPagina: number = 4;
let maxPosicion: number;

// Carrito de compras
interface ProductoCarrito {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    vendedor: string;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
    descripcion: string;
    imagen: string;
    vendedor: string;
}

let carrito: ProductoCarrito[] = [];
let todosLosProductos: Producto[] = [];
let productosFiltrados: Producto[] = [];

// Inicializar el carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    verificarTipoUsuario();
    
    cargarProductosVendedores();
    cargarCarrito();
    configurarEventosCarrito();
    configurarBusqueda();
    actualizarBotonLogin();
});

function cargarProductosVendedores(): void {
    const productosVendedor = localStorage.getItem('productosVendedor');
    const carruselContainer = document.getElementById('carrusel-productos');
    
    if (!carruselContainer) return;
    
    if (!productosVendedor) {
        carruselContainer.innerHTML = '<p style="padding: 40px; text-align: center; color: #888;">No hay productos disponibles</p>';
        todosLosProductos = [];
        productosFiltrados = [];
        return;
    }
    
    todosLosProductos = JSON.parse(productosVendedor);
    productosFiltrados = [...todosLosProductos];
    
    mostrarProductos(productosFiltrados);
}

function mostrarProductos(productos: Producto[]): void {
    const carruselContainer = document.getElementById('carrusel-productos');
    
    if (!carruselContainer) return;
    
    if (productos.length === 0) {
        carruselContainer.innerHTML = '<p style="padding: 40px; text-align: center; color: #888;">No se encontraron productos</p>';
        return;
    }
    
    carruselContainer.innerHTML = productos.map((producto) => `
        <div class="producto-card">
            <img src="${producto.imagen}" alt="${producto.nombre}" />
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            <p style="font-size: 0.9rem; color: #666; margin: 5px 0;">Vendedor: ${producto.vendedor}</p>
            <button class="btn-agregar-carrito" onclick="agregarAlCarrito(${producto.id})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
    
    // Actualizar variables del carrusel
    carrusel = document.querySelector('.carrusel');
    totalProductos = document.querySelectorAll('.producto-card').length;
    maxPosicion = Math.max(0, totalProductos - productosPorPagina);
    posicionActual = 0;
    
    // Resetear posición del carrusel
    if (carrusel) {
        carrusel.style.transform = 'translateX(0px)';
    }
}

function configurarBusqueda(): void {
    const inputBusqueda = document.getElementById('buscar-input') as HTMLInputElement;
    const btnBuscar = document.getElementById('btn-buscar') as HTMLButtonElement;
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            realizarBusqueda();
        });
    }
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                realizarBusqueda();
            }
        });
    }
}

function realizarBusqueda(): void {
    const inputBusqueda = document.getElementById('buscar-input') as HTMLInputElement;
    
    if (!inputBusqueda) return;
    
    const termino = inputBusqueda.value.trim();
    
    if (termino === '') {
        alert('Por favor, ingrese al menos una palabra clave para realizar la búsqueda.');
        return;
    }
    
    buscarProductos(termino);
}

function buscarProductos(termino: string): void {
    const terminoLower = termino.toLowerCase();
    
    productosFiltrados = todosLosProductos.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion.toLowerCase().includes(terminoLower)
    );
    
    mostrarProductos(productosFiltrados);
    
    if (productosFiltrados.length === 0) {
        const carruselContainer = document.getElementById('carrusel-productos');
        if (carruselContainer) {
            carruselContainer.innerHTML = `
                <div style="padding: 60px; text-align: center; width: 100%;">
                    <h3 style="color: #666; font-size: 1.5rem; margin-bottom: 10px;">No se encontraron productos</h3>
                    <p style="color: #888; font-size: 1.1rem;">No hay productos que coincidan con "${termino}"</p>
                    <button onclick="limpiarBusqueda()" style="margin-top: 20px; padding: 10px 20px; background: #E43636; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        Ver todos los productos
                    </button>
                </div>
            `;
        }
        console.log(`No se encontraron resultados para: "${termino}"`);
    } else {
        console.log(`Se encontraron ${productosFiltrados.length} resultados para: "${termino}"`);
    }
}

function limpiarBusqueda(): void {
    const inputBusqueda = document.getElementById('buscar-input') as HTMLInputElement;
    if (inputBusqueda) {
        inputBusqueda.value = '';
    }
    productosFiltrados = [...todosLosProductos];
    mostrarProductos(productosFiltrados);
}

function configurarEventosCarrito(): void {
    const btnCarrito = document.getElementById('btn-carrito');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const modalCarrito = document.getElementById('modal-carrito');
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    
    if (btnCarrito) {
        btnCarrito.addEventListener('click', abrirCarrito);
    }
    
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarCarrito);
    }
    
    if (modalCarrito) {
        modalCarrito.addEventListener('click', (e) => {
            if (e.target === modalCarrito) {
                cerrarCarrito();
            }
        });
    }
    
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', finalizarCompra);
    }
}

function agregarAlCarrito(productoId: number): void {
    const producto = todosLosProductos.find(p => p.id === productoId);
    
    if (!producto) return;
    
    // Verificar si ya está en el carrito
    const yaEnCarrito = carrito.find(item => item.id === productoId);
    if (yaEnCarrito) {
        alert('Este producto ya está en tu carrito');
        return;
    }
    
    const productoCarrito: ProductoCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        vendedor: producto.vendedor
    };
    
    carrito.push(productoCarrito);
    guardarCarrito();
    actualizarContadorCarrito();
    
    console.log('Producto agregado al carrito:', productoCarrito);
    alert(`"${producto.nombre}" agregado al carrito`);
}

function eliminarDelCarrito(productoId: number): void {
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
}

function abrirCarrito(): void {
    const modal = document.getElementById('modal-carrito');
    if (modal) {
        modal.classList.add('active');
        mostrarCarrito();
    }
}

function cerrarCarrito(): void {
    const modal = document.getElementById('modal-carrito');
    if (modal) {
        modal.classList.remove('active');
    }
}

function mostrarCarrito(): void {
    const carritoItems = document.getElementById('carrito-items');
    const totalCarrito = document.getElementById('total-carrito');
    const btnFinalizar = document.getElementById('btn-finalizar-compra') as HTMLButtonElement;
    
    if (!carritoItems || !totalCarrito) return;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        totalCarrito.textContent = '$0.00';
        if (btnFinalizar) btnFinalizar.disabled = true;
        return;
    }
    
    carritoItems.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="carrito-item-info">
                <h4>${item.nombre}</h4>
                <p class="vendedor">Vendedor: ${item.vendedor}</p>
                <p class="carrito-item-precio">$${item.precio.toFixed(2)}</p>
            </div>
            <div class="carrito-item-acciones">
                <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
    
    if (btnFinalizar) btnFinalizar.disabled = false;
}

function actualizarContadorCarrito(): void {
    const contador = document.querySelector('.carrito-count');
    if (contador) {
        contador.textContent = carrito.length.toString();
    }
}

function guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

function finalizarCompra(): void {
    if (carrito.length === 0) return;
    
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    const confirmacion = confirm(
        `¿Confirmar compra?\n\nTotal: $${total.toFixed(2)}\nProductos: ${carrito.length}`
    );
    
    if (confirmacion) {
        alert('¡Compra realizada con éxito! Gracias por tu compra.');
        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito();
        cerrarCarrito();
    }
}

function verificarTipoUsuario(): void {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (usuarioActivo) {
        const usuario = JSON.parse(usuarioActivo);
        
        // Si es vendedor, redirigir a su dashboard
        if (usuario.tipo === 'vendedor') {
            window.location.href = '/src/pages/dashboard-vendedor.html';
        }
    }
}

function moverCarrusel(direccion: number): void {
    posicionActual += direccion;
    
    if (posicionActual < 0) {
        posicionActual = 0;
    } else if (posicionActual > maxPosicion) {
        posicionActual = maxPosicion;
    }
    
    const tarjeta = document.querySelector('.producto-card') as HTMLElement;
    if (tarjeta && carrusel) {
        const anchoTarjeta = tarjeta.offsetWidth;
        const gap = 20;
        const desplazamiento = -(posicionActual * (anchoTarjeta + gap));
        carrusel.style.transform = `translateX(${desplazamiento}px)`;
    }
}

// Hacer la función disponible globalmente para compatibilidad
(window as any).moverCarrusel = moverCarrusel;
(window as any).agregarAlCarrito = agregarAlCarrito;
(window as any).eliminarDelCarrito = eliminarDelCarrito;
(window as any).limpiarBusqueda = limpiarBusqueda;

function actualizarBotonLogin(): void {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const btnLogin = document.querySelector('.btn-login') as HTMLButtonElement;
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion') as HTMLButtonElement;
    
    if (btnLogin) {
        if (usuarioActivo) {
            // Usuario está logueado
            const usuario = JSON.parse(usuarioActivo);
            btnLogin.textContent = 'Mi Cuenta';
            btnLogin.onclick = () => {
                alert(`Bienvenido ${usuario.nombreEmpresa || usuario.nombre}!\n\nTipo de cuenta: ${usuario.tipo}`);
            };
            
            // Mostrar botón de cerrar sesión
            if (btnCerrarSesion) {
                btnCerrarSesion.style.display = 'block';
                btnCerrarSesion.onclick = cerrarSesion;
            }
        } else {
            // No hay sesión activa
            btnLogin.textContent = 'Iniciar Sesión';
            btnLogin.onclick = () => {
                window.location.href = '/src/pages/login.html';
            };
            
            // Ocultar botón de cerrar sesión
            if (btnCerrarSesion) {
                btnCerrarSesion.style.display = 'none';
            }
        }
    }
}

function cerrarSesion(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('carrito');
        window.location.href = '/src/pages/login.html';
    }
}

// Exportar para convertir en módulo y evitar conflictos
export {};
