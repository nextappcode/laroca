class Carrito{
    //Añadir el producto al carrito
    comprarProducto(e){
        e.preventDefault();
        if(e.target.classList.contains('agregar-carrito')){
            const producto = e.target.parentElement;
            this.leerDatosProducto(producto);
            //console.log(producto);            
        }
    }

    leerDatosProducto(producto){
        const infoProducto ={
            imagen : producto.querySelector('img').src,
            titulo : producto.querySelector('h5').textContent,
            precio : parseFloat(producto.querySelector('.precio').textContent),
            id : producto.querySelector('a').getAttribute('data-id'),
            cantidad : 1
        }
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function(productoLS){
            if(productoLS.id === infoProducto.id){
                productosLS = productoLS.id;
            }
        });
        if(productosLS === infoProducto.id){
            //console.log('El producto ya está agregado');
            Swal.fire({
                icon: 'warning',
                title: 'No tenemos stock suficiente, prueba con menos unidades',
                timer: 2500,
                showConfirmButton: false
            })
        }
        else{
            this.insertarCarrito(infoProducto);
            //console.log(infoProducto);
            Swal.fire({
                icon: 'success',
                title: 'Agregado',
                timer: 2500,
                showConfirmButton: false
            })
        }
        
    }

    insertarCarrito(producto){
        const row = document.createElement('tr');
        row.innerHTML= `
        <td>
        <img src="${producto.imagen}" width=100>
        </td>
        <td>${producto.titulo}</td>
        <td>${producto.precio}</td>
        <td>
        <a href="#" class="borrar-producto fas fa-times-circle" data-id="${producto.id}"></a>
        </td>
        `;
        listaProductos.appendChild(row);
        this.guardarProductosLocalStorage(producto);
    }

    eliminarProducto(e){
        e.preventDefault();
        let producto, productoID;
        if(e.target.classList.contains('borrar-producto')){
            e.target.parentElement.parentElement.remove();
            producto = e.target.parentElement.parentElement;
            productoID = producto.querySelector('a').getAttribute('data-id');
            Swal.fire({
                icon: 'info',
                title: 'Eliminado',
                timer: 2500,
                showConfirmButton: false
            })
        }
        this.eliminarProductoLocalStorage(productoID);
        this.calcularTotal();        
    }

    vaciarCarrito(e){
        e.preventDefault();
        localStorage.clear();
        while(listaProductos.firstChild){
            listaProductos.removeChild(listaProductos.firstChild);
            Swal.fire({
                icon: 'info',
                title: 'Carrito Vacío',
                timer: 2500,
                showConfirmButton: false
            })
        }
        this.vaciarLocalStorage();
        return false;
    }

    guardarProductosLocalStorage(producto){
        let productos;
        productos = this.obtenerProductosLocalStorage();
        productos.push(producto);
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    obtenerProductosLocalStorage(){
        let productoLS;
        if(localStorage.getItem('productos')===null){
            productoLS = [];
        }
        else{
            productoLS = JSON.parse(localStorage.getItem('productos'));
        }
        return productoLS;
    }

    eliminarProductoLocalStorage(productoID){
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function(productoLS, index){
            if(productoLS.id === productoID){
                productosLS.splice(index, 1);
            }
        });
        localStorage.setItem('productos', JSON.stringify(productosLS));
    }

    leerLocalStorage(){
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function(producto){
            const row = document.createElement('tr');
            row.innerHTML= `
            <td>
            <img src="${producto.imagen}" width=100>
            </td>
            <td>${producto.titulo}</td>
            <td>${producto.precio}</td>
            <td>
            <a href="#" class="borrar-producto fas fa-times-circle" data-id="${producto.id}"></a>
            </td>
            `;
            listaProductos.appendChild(row);
        });
    }

    leerLocalStorageCompra(){
        let productosLS;
        productosLS = this.obtenerProductosLocalStorage();
        productosLS.forEach(function(producto){
            const row = document.createElement('tr');
            row.innerHTML= `
            <td>
            <img src="${producto.imagen}" width=100>
            </td>
            <td>${producto.titulo}</td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.precio * producto.cantidad}</td>
            <td>
            <a href="#" class="borrar-producto fas fa-times-circle" data-id="${producto.id}"></a>
            </td>
            `;
            listaCompra.appendChild(row);
        });
    }    

    vaciarLocalStorage(){
        localStorage.clear();        
    }

    procesarPedido(e){
        e.preventDefault();
        if(this.obtenerProductosLocalStorage().length === 0){
            //console.log('El carrito está vacío, agrega algún producto');
             Swal.fire({
                icon: 'error',
                title: 'El carrito está vacío, agrega un producto',
                timer: 2500,
                showConfirmButton: false
            })
        }
        else{
            enviarWhatsApp(); // Llama a la función para enviar WhatsApp
            location.href="carrito.html";
        }
    }

    calcularTotal(){
        let productoLS;
        let total = 0, subtotal = 0, igv = 0;
        productoLS = this.obtenerProductosLocalStorage();
        for(let i = 0; i < productoLS.length; i++){
            let element = Number(productoLS[i].precio*productoLS[i].cantidad);
            total = total + element;
        }
        igv = parseFloat(total * 0.18).toFixed(2);
        subtotal = parseFloat(total-igv).toFixed(2);

        document.getElementById('subtotal').innerHTML =  subtotal + " Bs.";
        document.getElementById('igv').innerHTML = igv + " Bs." ;
        document.getElementById('total').value = total.toFixed(2) + " Bs.";
    }

}

function enviarWhatsApp() {
    const clienteInput = document.getElementById('cliente');
    const direccionInput = document.getElementById('direccion');

    if (!clienteInput || !direccionInput) {
        console.error("Los elementos no se encontraron en el DOM.");
        return;
    }

    const cliente = clienteInput.value;
    const direccion = direccionInput.value;

    let productosLS = JSON.parse(localStorage.getItem('productos')) || [];
    if (productosLS.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = `Detalles de la compra de ${cliente}:\nDirección: ${direccion}\n\n`;

    productosLS.forEach(producto => {
        mensaje += `Producto: ${producto.titulo}\nPrecio: ${producto.precio} Bs.\nCantidad: ${producto.cantidad}\n\n`;
    });

    const total = document.getElementById('total').value;
    mensaje += `Total de la compra: ${total}`;
    
    const numeroWhatsApp = '+59169542526'; // Reemplaza con el número de WhatsApp deseado
    const url = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank'); // Abre WhatsApp en una nueva pestaña
}
