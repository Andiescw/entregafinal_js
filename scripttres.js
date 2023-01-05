fetch("./data.json")
.then(respuesta => respuesta.json())
.then(habitaciones => {

// ------------------------------------
  let arrayCarrito = []

  renderizarHabitaciones(habitaciones);
  renderizarCarrito();

// ------------------------------------ LOGICA PRINCIPAL

function estimado(noches, personas, precioHab) { 
    let personaExtra = 250;
    let costoExtra = 0;
    let extraQty = 0;
    let precioNoches = 0;
    precioNoches = noches * precioHab;

    if (personas > 1 && personas < 5 ) {
        extraQty = personas - 1;
        costoExtra = (personaExtra * extraQty) * noches;
    }
    
    let precioEstimado = precioNoches + costoExtra;
    return precioEstimado;
}


// ------------------------------------ CARDS

function renderizarHabitaciones(arrayHabitaciones) {
  let contenedorHabitaciones = document.getElementById("contenedorHabitaciones")  
  contenedorHabitaciones.innerHTML = ''
    for (const habitacion of arrayHabitaciones) {
        let tarjetaHabitacion = document.createElement("div")
        tarjetaHabitacion.className = "container";

        tarjetaHabitacion.innerHTML = `
        <div class="card">

        <img class="card-img" src=${habitacion.imgUrl}>
        <h4 class="card-title pt-2">${habitacion.tipo}</h4>
        <p class="card-text">Amenidades: ${habitacion.amenidades}</p>
        <h6 class="card-subtitle pb-2">${"$" + habitacion.precio + " MXN"}</h6>
        <button type="button" class="btn btn-danger bg-gradient justify-content-center" id='roomid-${habitacion.id}'>Seleccionar</button>
        
        </div>
        `
        contenedorHabitaciones.append(tarjetaHabitacion)

        let boton = document.getElementById("roomid-" + habitacion.id)
        boton.addEventListener("click", tipoHabitacion)
        boton.tipoHabitacion = habitacion.tipo;
    }
}

// ------------------------------------

let precioHabitacion = 0;
let habitacionSelecionada = {};

function tipoHabitacion(event) {
  precioHabitacion = habitaciones.find(habitacion => habitacion.tipo === event.currentTarget.tipoHabitacion).precio;
  habitacionSelecionada = habitaciones.find(habitacion => habitacion.tipo === event.currentTarget.tipoHabitacion);

  if (tipoHabitacion) {
    qtyNoches();
  }
}

// ------------------------------------ CANTIDAD NOCHES

let cantidadNoches = 0;
async function qtyNoches() { 
    const ipAPI = '//api.ipify.org?format=json'

    const inputValue = fetch(ipAPI)
    .then(response => response.json())
    .then(data => data.ip)

    const { value: quantityNights } = await Swal.fire({
    title: '¿Por cuántas noches sera tu estadia?',
    input: 'text',
    showCancelButton: true,
    inputValidator: (value) => {
        if (!value) {
        return 'Necesitas escribir algo!'
        }
    }
    })

    if (quantityNights) {
      cantidadNoches = quantityNights;
      qtyPersonas();
    }
}

// ------------------------------------ CANTIDAD PERSONAS

let cantidadPersonas = 0;
async function qtyPersonas() { 
  const ipAPI = '//api.ipify.org?format=json'

  const inputValue = fetch(ipAPI)
  .then(response => response.json())
  .then(data => data.ip)

  const { value: quantityPersons } = await Swal.fire({
  title: '¿Cuantás personas se hospedan en la misma habitación?',
  input: 'text',
  showCancelButton: true,
  inputValidator: (value) => {
      if (!value) {
      return 'Necesitas escribir algo!'
      }
  }
  })

  if (quantityPersons) {
    cantidadPersonas = quantityPersons;
    totalEstimado();
  }
}

// ------------------------------------ TOTAL ESTIMADO

function totalEstimado() {
  let precioEstimado = estimado(cantidadNoches, cantidadPersonas, precioHabitacion);

    arrayCarrito.push({
        "id": habitacionSelecionada.id,
        "cartId": uuidv4(),
        "tipo": habitacionSelecionada.tipo,
        "precioHabitacion": precioHabitacion,
        "tamano": habitacionSelecionada.tamano,
        "amenidades": habitacionSelecionada.amenidades,
        "imgUrl": habitacionSelecionada.imgUrl,
        "cantidadNoches": cantidadNoches,
        "cantidadPersonas": cantidadPersonas,
        "precioEstimado": precioEstimado
    });
    debugger
    localStorage.setItem("arrayCarrito", JSON.stringify(arrayCarrito));
    renderizarCarrito();

  Swal.fire({
      title: 'Tu precio estimado es de:',
      text: '$ ' + precioEstimado + 'MXN',
      icon: 'success',
      confirmButtonText: 'Cool'
  })
}

// ------------------------------------ CARRITO

function renderizarCarrito() {
  let carrito = document.getElementById("carrito")
  carrito.innerHTML = ""

  var carritoLocalStorage = JSON.parse(localStorage.getItem('arrayCarrito')) || [];
  arrayCarrito = carritoLocalStorage;
  
  for (const itemCarrito of carritoLocalStorage) {
      let tarjetaCarrito = document.createElement("div")
      tarjetaCarrito.className = "card";

      tarjetaCarrito.innerHTML = `
      <img class="card-img" src=${itemCarrito.imgUrl}>
      <p class="card-title pt-2"><strong>Tipo:</strong> ${itemCarrito.tipo}</p>
      <p class="card-text"><strong>Cantidad de Noches:</strong> ${itemCarrito.cantidadNoches}</p>
      <p class="card-text"><strong>Cantidad de Personas:</strong> ${itemCarrito.cantidadPersonas}</p>
      <p card-subtitle pb-2><strong>Precio Estimado:</strong> $${itemCarrito.precioEstimado} MXN</p>
      <button type="button" class="btn btn-danger bg-gradient justify-content-center" id='cartid-${itemCarrito.cartId}'>Eliminar</button>
      `;
      carrito.append(tarjetaCarrito);

      let boton = document.getElementById("cartid-" + itemCarrito.cartId)
      boton.addEventListener("click", eliminarDelCarrito)
      boton.cartId = itemCarrito.cartId;
  }
}

function eliminarDelCarrito(event) {
  debugger
  var carritoLocalStorage = JSON.parse(localStorage.getItem('arrayCarrito')) || [];
  for (var i = 0; i < carritoLocalStorage.length; i++) {
      if (carritoLocalStorage[i].cartId == event.currentTarget.cartId) {
          carritoLocalStorage.splice(i, 1);
      }
  }

  localStorage.setItem("arrayCarrito", JSON.stringify(carritoLocalStorage));
  renderizarCarrito();
}


function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

}) // FETCH


 
//let precioEstimado = estimado(qtyNoches, qtyPersonas, precioHabitacion);
//<p class="card-text">Capacidad: ${habitacion.capacidad} persona(s)</p>