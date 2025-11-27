// Interfaces
interface Producto {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
    descripcion: string;
    imagen: string;
    vendedor: string;
}

interface Usuario {
    tipo: 'comprador' | 'vendedor';
    email: string;
    password: string;
    nombreEmpresa?: string;
    nombre?: string;
    apellido?: string;
}

interface Venta {
    id: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    total: number;
    fecha: string; // ISO format
    comprador: string;
}

interface DetalleVentaProducto {
    producto: Producto;
    cantidadVendida: number;
    ingresoTotal: number;
    numeroVentas: number;
    ultimaVenta: string;
}

type PeriodoTiempo = 'semana' | 'mes' | 'año' | 'todo';

// Estado de la aplicación
let seccionActual: string = 'publicar';
let productos: Producto[] = [];
let productoIdCounter: number = 1;
let ventas: Venta[] = [];
let ventaIdCounter: number = 1;
let periodoSeleccionado: PeriodoTiempo = 'mes';

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    configurarNavegacion();
    configurarFormulario();
    configurarFiltroPeriodo();
    actualizarBotonLogin();
    cargarProductos();
    cargarVentas();
    generarVentasEjemplo(); // Para testing
    actualizarEstadisticas();
});

function verificarSesion(): void {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (!usuarioActivo) {
        // No hay sesión, redirigir a login
        window.location.href = '/src/pages/login.html';
        return;
    }
    
    const usuario: Usuario = JSON.parse(usuarioActivo);
    
    // Verificar que sea un vendedor
    if (usuario.tipo !== 'vendedor') {
        // Es comprador, redirigir a index.html
        window.location.href = '/index.html';
        return;
    }
    
    console.log('Sesión de vendedor verificada:', usuario);
}

function configurarNavegacion(): void {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const seccionId = item.id.replace('nav-', '');
            cambiarSeccion(seccionId);
        });
    });
}

function cambiarSeccion(nombreSeccion: string): void {
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navActivo = document.getElementById(`nav-${nombreSeccion}`);
    if (navActivo) {
        navActivo.classList.add('active');
    }
    
    // Mostrar sección correspondiente
    document.querySelectorAll('.seccion-vendedor').forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    const seccionActiva = document.getElementById(`seccion-${nombreSeccion}`);
    if (seccionActiva) {
        seccionActiva.classList.add('active');
    }
    
    seccionActual = nombreSeccion;
    
    // Actualizar estadísticas si se accede a esa sección
    if (nombreSeccion === 'estadisticas') {
        actualizarEstadisticas();
    }
}

function configurarFormulario(): void {
    const form = document.getElementById('form-producto') as HTMLFormElement;
    const inputImagen = document.getElementById('imagen-producto') as HTMLInputElement;
    
    if (form) {
        form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            publicarProducto();
        });
    }
    
    if (inputImagen) {
        inputImagen.addEventListener('change', validarYPrevisualizarImagen);
    }
}

function validarYPrevisualizarImagen(e: Event): void {
    const input = e.target as HTMLInputElement;
    const preview = document.getElementById('preview-imagen');
    const imgPreview = document.getElementById('imagen-preview') as HTMLImageElement;
    
    if (!input.files || input.files.length === 0) {
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const archivo = input.files[0];
    
    if (!archivo) return;
    
    // Validar formato
    const formatosPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (formatosPermitidos.indexOf(archivo.type) === -1) {
        alert('Formato de imagen no válido. Por favor, use JPG, JPEG, PNG o WEBP.');
        input.value = '';
        if (preview) preview.style.display = 'none';
        return;
    }
    
    // Validar tamaño (5MB máximo)
    const tamañoMaximo = 5 * 1024 * 1024;
    if (archivo.size > tamañoMaximo) {
        alert('El tamaño de la imagen excede el límite de 5MB. Por favor, seleccione una imagen más pequeña.');
        input.value = '';
        if (preview) preview.style.display = 'none';
        return;
    }
    
    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target && imgPreview && preview) {
            imgPreview.src = event.target.result as string;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(archivo);
}

function publicarProducto(): void {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (!usuarioActivo) return;
    
    const usuario: Usuario = JSON.parse(usuarioActivo);
    
    const nombre = (document.getElementById('nombre-producto') as HTMLInputElement).value.trim();
    const precioInput = (document.getElementById('precio-producto') as HTMLInputElement).value;
    const categoria = (document.getElementById('categoria-producto') as HTMLSelectElement).value;
    const descripcion = (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value.trim();
    const inputImagen = document.getElementById('imagen-producto') as HTMLInputElement;
    
    // Validar campos obligatorios
    const camposFaltantes: string[] = [];
    
    if (!nombre) camposFaltantes.push('Nombre del Producto');
    if (!precioInput || parseFloat(precioInput) <= 0) camposFaltantes.push('Precio válido');
    if (!categoria) camposFaltantes.push('Categoría');
    if (!descripcion) camposFaltantes.push('Descripción');
    if (!inputImagen.files || inputImagen.files.length === 0) camposFaltantes.push('Imagen del Producto');
    
    if (camposFaltantes.length > 0) {
        const mensaje = 'Por favor, complete los siguientes campos obligatorios:\n\n' + 
                       camposFaltantes.map(campo => '- ' + campo).join('\n');
        alert(mensaje);
        return;
    }
    
    const precio = parseFloat(precioInput);
    
    // Convertir imagen a base64
    if (!inputImagen.files || inputImagen.files.length === 0) return;
    
    const archivo = inputImagen.files[0];
    if (!archivo) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        if (!event.target) return;
        
        const imagenBase64 = event.target.result as string;
        
        const nuevoProducto: Producto = {
            id: productoIdCounter++,
            nombre,
            precio,
            categoria,
            descripcion,
            imagen: imagenBase64,
            vendedor: usuario.nombreEmpresa || usuario.email
        };
        
        productos.push(nuevoProducto);
        guardarProductos();
        
        console.log('Producto publicado:', nuevoProducto);
        alert(`Producto "${nombre}" publicado exitosamente en el catálogo.`);
        
        // Limpiar formulario
        (document.getElementById('form-producto') as HTMLFormElement).reset();
        const preview = document.getElementById('preview-imagen');
        if (preview) preview.style.display = 'none';
        
        // Actualizar lista de productos
        mostrarProductos();
        actualizarEstadisticas();
        
        // Cambiar a sección de publicar para ver el producto listado
        cambiarSeccion('publicar');
    };
    
    reader.readAsDataURL(archivo);
}

function mostrarProductos(): void {
    const listaProductos = document.getElementById('lista-productos');
    if (!listaProductos) return;
    
    if (productos.length === 0) {
        listaProductos.innerHTML = '<p class="mensaje-vacio">Aún no has publicado ningún producto</p>';
        return;
    }
    
    listaProductos.innerHTML = productos.map(producto => `
        <div class="producto-vendedor-card">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h4>${producto.nombre}</h4>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            <span class="categoria">${producto.categoria}</span>
            <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">${producto.descripcion}</p>
            <div class="producto-acciones">
                <button class="btn-editar" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function eliminarProducto(id: number): void {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
        productos = productos.filter(p => p.id !== id);
        guardarProductos();
        mostrarProductos();
        actualizarEstadisticas();
        console.log('Producto eliminado:', producto);
    }
}

function editarProducto(id: number): void {
    alert('Función de edición en desarrollo');
}

function guardarProductos(): void {
    localStorage.setItem('productosVendedor', JSON.stringify(productos));
}

function cargarProductos(): void {
    const productosGuardados = localStorage.getItem('productosVendedor');
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
        // Actualizar el contador
        if (productos.length > 0) {
            productoIdCounter = Math.max(...productos.map(p => p.id)) + 1;
        }
        mostrarProductos();
    }
}

function actualizarEstadisticas(): void {
    const statProductos = document.getElementById('stat-productos');
    const statVentas = document.getElementById('stat-ventas');
    const statVendidos = document.getElementById('stat-vendidos');
    const statCalificacion = document.getElementById('stat-calificacion');
    
    const ventasFiltradas = filtrarVentasPorPeriodo(ventas, periodoSeleccionado);
    const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
    const totalUnidades = ventasFiltradas.reduce((sum, venta) => sum + venta.cantidad, 0);
    
    if (statProductos) statProductos.textContent = productos.length.toString();
    if (statVentas) statVentas.textContent = `$${totalVentas.toFixed(2)}`;
    if (statVendidos) statVendidos.textContent = totalUnidades.toString();
    if (statCalificacion) statCalificacion.textContent = '⭐ 4.5'; // Por ahora estático
    
    // Actualizar lista de ventas por producto
    mostrarVentasPorProducto();
}

function configurarFiltroPeriodo(): void {
    const selectPeriodo = document.getElementById('select-periodo') as HTMLSelectElement;
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            periodoSeleccionado = target.value as PeriodoTiempo;
            actualizarEstadisticas();
        });
    }
}

function filtrarVentasPorPeriodo(todasVentas: Venta[], periodo: PeriodoTiempo): Venta[] {
    const ahora = new Date();
    let fechaLimite: Date;
    
    switch (periodo) {
        case 'semana':
            fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'mes':
            fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'año':
            fechaLimite = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        case 'todo':
            return todasVentas;
        default:
            fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return todasVentas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        return fechaVenta >= fechaLimite;
    });
}

function mostrarVentasPorProducto(): void {
    const listaVentas = document.getElementById('lista-ventas-productos');
    if (!listaVentas) return;
    
    const ventasFiltradas = filtrarVentasPorPeriodo(ventas, periodoSeleccionado);
    
    if (ventasFiltradas.length === 0) {
        listaVentas.innerHTML = '<p class="mensaje-vacio">No hay ventas en este periodo</p>';
        return;
    }
    
    // Agrupar ventas por producto
    const detallesPorProducto = calcularDetallesVentas(ventasFiltradas);
    
    if (detallesPorProducto.length === 0) {
        listaVentas.innerHTML = '<p class="mensaje-vacio">No hay ventas en este periodo</p>';
        return;
    }
    
    // Ordenar por ingresos (mayor a menor)
    detallesPorProducto.sort((a, b) => b.ingresoTotal - a.ingresoTotal);
    
    listaVentas.innerHTML = detallesPorProducto.map(detalle => `
        <div class="venta-producto-card" onclick="mostrarDetalleProducto(${detalle.producto.id})">
            <img src="${detalle.producto.imagen}" alt="${detalle.producto.nombre}" />
            <div class="venta-producto-info">
                <h4>${detalle.producto.nombre}</h4>
                <div class="venta-stats">
                    <span class="venta-stat">
                        <strong>Unidades:</strong> ${detalle.cantidadVendida}
                    </span>
                    <span class="venta-stat">
                        <strong>Ingresos:</strong> $${detalle.ingresoTotal.toFixed(2)}
                    </span>
                    <span class="venta-stat">
                        <strong>Ventas:</strong> ${detalle.numeroVentas}
                    </span>
                </div>
                <p class="ultima-venta">Última venta: ${formatearFecha(detalle.ultimaVenta)}</p>
            </div>
            <button class="btn-ver-detalle">Ver detalle →</button>
        </div>
    `).join('');
}

function calcularDetallesVentas(ventasFiltradas: Venta[]): DetalleVentaProducto[] {
    const detallesPorId: { [key: number]: DetalleVentaProducto } = {};
    
    ventasFiltradas.forEach(venta => {
        const producto = productos.find(p => p.id === venta.productoId);
        if (!producto) return;
        
        if (!detallesPorId[venta.productoId]) {
            detallesPorId[venta.productoId] = {
                producto,
                cantidadVendida: 0,
                ingresoTotal: 0,
                numeroVentas: 0,
                ultimaVenta: venta.fecha
            };
        }
        
        const detalle = detallesPorId[venta.productoId];
        if (detalle) {
            detalle.cantidadVendida += venta.cantidad;
            detalle.ingresoTotal += venta.total;
            detalle.numeroVentas += 1;
            
            // Actualizar última venta si es más reciente
            if (new Date(venta.fecha) > new Date(detalle.ultimaVenta)) {
                detalle.ultimaVenta = venta.fecha;
            }
        }
    });
    
    return Object.keys(detallesPorId).map(key => detallesPorId[parseInt(key)]).filter((d): d is DetalleVentaProducto => d !== undefined);
}

function mostrarDetalleProducto(productoId: number): void {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const ventasFiltradas = filtrarVentasPorPeriodo(ventas, periodoSeleccionado);
    const ventasProducto = ventasFiltradas.filter(v => v.productoId === productoId);
    
    if (ventasProducto.length === 0) {
        alert('No hay ventas para este producto en el periodo seleccionado');
        return;
    }
    
    const detallesArray = calcularDetallesVentas(ventasProducto);
    const detalles = detallesArray[0];
    
    if (!detalles) {
        alert('No se pudieron cargar los detalles del producto');
        return;
    }
    
    // Actualizar modal de detalle
    const modalDetalle = document.getElementById('detalle-producto-ventas');
    const detalleImagen = document.getElementById('detalle-imagen') as HTMLImageElement;
    const detalleNombre = document.getElementById('detalle-nombre');
    const detallePrecio = document.getElementById('detalle-precio');
    const detalleCategoria = document.getElementById('detalle-categoria');
    const detalleUnidades = document.getElementById('detalle-unidades');
    const detalleIngresos = document.getElementById('detalle-ingresos');
    const detalleNumVentas = document.getElementById('detalle-num-ventas');
    const detalleUltimaVenta = document.getElementById('detalle-ultima-venta');
    
    if (detalleImagen) detalleImagen.src = producto.imagen;
    if (detalleNombre) detalleNombre.textContent = producto.nombre;
    if (detallePrecio) detallePrecio.textContent = `$${producto.precio.toFixed(2)}`;
    if (detalleCategoria) detalleCategoria.textContent = producto.categoria;
    if (detalleUnidades) detalleUnidades.textContent = detalles.cantidadVendida.toString();
    if (detalleIngresos) detalleIngresos.textContent = `$${detalles.ingresoTotal.toFixed(2)}`;
    if (detalleNumVentas) detalleNumVentas.textContent = detalles.numeroVentas.toString();
    if (detalleUltimaVenta) detalleUltimaVenta.textContent = formatearFecha(detalles.ultimaVenta);
    
    if (modalDetalle) {
        modalDetalle.style.display = 'block';
    }
    
    // Configurar botón cerrar
    const btnCerrar = document.getElementById('btn-cerrar-detalle');
    if (btnCerrar) {
        btnCerrar.onclick = cerrarDetalleProducto;
    }
}

function cerrarDetalleProducto(): void {
    const modalDetalle = document.getElementById('detalle-producto-ventas');
    if (modalDetalle) {
        modalDetalle.style.display = 'none';
    }
}

function formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
}

function cargarVentas(): void {
    const ventasGuardadas = localStorage.getItem('ventasVendedor');
    if (ventasGuardadas) {
        ventas = JSON.parse(ventasGuardadas);
        if (ventas.length > 0) {
            ventaIdCounter = Math.max(...ventas.map(v => v.id)) + 1;
        }
    }
}

function guardarVentas(): void {
    localStorage.setItem('ventasVendedor', JSON.stringify(ventas));
}

function generarVentasEjemplo(): void {
    // Solo generar si no hay ventas y hay productos
    if (ventas.length > 0 || productos.length === 0) return;
    
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (!usuarioActivo) return;
    
    const ahora = new Date();
    const ventasEjemplo: Venta[] = [];
    
    // Generar ventas aleatorias para los últimos 60 días
    productos.forEach(producto => {
        const numVentas = Math.floor(Math.random() * 10) + 1; // 1-10 ventas por producto
        
        for (let i = 0; i < numVentas; i++) {
            const diasAtras = Math.floor(Math.random() * 60);
            const fechaVenta = new Date(ahora.getTime() - diasAtras * 24 * 60 * 60 * 1000);
            const cantidad = Math.floor(Math.random() * 5) + 1; // 1-5 unidades
            
            ventasEjemplo.push({
                id: ventaIdCounter++,
                productoId: producto.id,
                cantidad,
                precioUnitario: producto.precio,
                total: cantidad * producto.precio,
                fecha: fechaVenta.toISOString(),
                comprador: `comprador${Math.floor(Math.random() * 100)}@example.com`
            });
        }
    });
    
    ventas = ventasEjemplo;
    guardarVentas();
    console.log(`Generadas ${ventasEjemplo.length} ventas de ejemplo`);
}

function actualizarBotonLogin(): void {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const btnLogin = document.querySelector('.btn-login') as HTMLButtonElement;
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion') as HTMLButtonElement;
    
    if (btnLogin && usuarioActivo) {
        const usuario: Usuario = JSON.parse(usuarioActivo);
        btnLogin.textContent = 'Mi Cuenta';
        btnLogin.onclick = () => {
            mostrarMenuCuenta(usuario);
        };
    }
    
    if (btnCerrarSesion) {
        btnCerrarSesion.onclick = cerrarSesion;
    }
}

function mostrarMenuCuenta(usuario: Usuario): void {
    alert(`Bienvenido ${usuario.nombreEmpresa}!\n\nTipo de cuenta: ${usuario.tipo}`);
}

function cerrarSesion(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActivo');
        window.location.href = '/src/pages/login.html';
    }
}

// Hacer funciones disponibles globalmente
(window as any).eliminarProducto = eliminarProducto;
(window as any).editarProducto = editarProducto;
(window as any).mostrarDetalleProducto = mostrarDetalleProducto;

export {};
