document.getElementById('loginBtn').addEventListener('click', function() {

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const validUsername = 'usuario';
    const validPassword = 'contraseña123';

    if(username === validUsername && password === validPassword){
        document.querySelector('.login-container').style.display = 'none';
        document.getElementById('menuContainer').style.display = 'block';
    }else{
        alert('Usuario o contraseña incorrectos');
    }

});

document.getElementById('facturaBtn').addEventListener('click',function(){
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('facturaContainer').style.display = 'block';
});

document.getElementById('generarFacturaBtn').addEventListener('click', function() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const documento = document.getElementById('documento').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const correo = document.getElementById('correo').value;

    if(nombre && apellido&&documento&&telefono&&direccion&&correo){

        generarPDF(nombre,apellido,documento,telefono,direccion,correo);

        guardarDatos(nombre,apellido,documento,telefono,direccion,correo);

        document.getElementById('nombre').value = '';
        document.getElementById('apellido').value = '';
        document.getElementById('documento').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('correo').value = '';

        actualizarLista();

    }else{
        alert('por favor, complete todos los campos');
    }
});

document.getElementById('enviarCorreoBtn').addEventListener('click',  async function(){
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const documento = document.getElementById('documento').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const correo = document.getElementById('correo').value;

    if(nombre&&apellido&&documento&&telefono&&direccion&&correo){

        const pdfData = await generarPDFBase64(nombre,apellido,documento,telefono,direccion,correo)

        await enviarFacturaPorCorreo(correo,pdfData,nombre,apellido);
    }else{
        alert('por favor, complete todos los campos antes de enviar al correo');
    }
});

async function guardarDatos(nombre,apellido,documento,telefono,direccion,correo){
    try{
        const response = await fetch('/api/datos',{
           method: 'POST',
           headers: {
                'Content-Type': 'application/json'
           },
           body: JSON.stringify({nombre,apellido,documento,telefono,direccion,correo})
        });
        if(!response.ok) throw new Error('error al guardar datos');
        return await response.json();
    }catch(error){
        console.error('Error:', error)
    }
}

async function actualizarLista(){
    try{
        const response = await fetch('/api/datos');
        if(!response.ok) throw new Error('Error al obtener datos');
        const datos = await response.json();
        const dataList = document.getElementById('dataList');
        dataList.innerHTML = '';

        datos.forEach(dato =>{
            const listItem = document.createElement('li');
            listItem.textContent = `${dato.nombre} ${dato.apellido} - ${dato.documento} - ${dato.telefono} - ${dato.telefono}
            - ${dato.direccion} - ${dato.correo}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'action-btn';
            deleteBtn.addEventListener('click', () => eliminarDato(dato._id));
            listItem.appendChild(deleteBtn);

            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Actualizar';
            updateBtn.className ='action-btn';
            updateBtn.addEventListener('click', () => actualizarDato(dato));

            listItem.appendChild(updateBtn);
            listItem.appendChild(deleteBtn);

            dataList.appendChild(listItem);
        })
    }catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarDato(id){
    try {
        await fetch(`/api/datos/${id}`,{
            method : 'DELETE'
        });
        await actualizarLista();
    }catch (error) {
        console.error('Error:', error);
    }
}

function actualizarDato(dato) {
    document.getElementById('nombre').value = dato.nombre;
    document.getElementById('apellido').value = dato.apellido;
    document.getElementById('documento').value = dato.documento;
    document.getElementById('telefono').value = dato.telefono;
    document.getElementById('direccion').value = dato.direccion;
    document.getElementById('correo').value = dato.correo;
    
    eliminarDato(dato._id);
}

function generarPDF(nombre,apellido,documento,telefono,direccion,correo){
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();
    doc.text(20,20, `Factura para ${nombre} ${apellido}`);
    doc.text(20,30, `Documento ${documento}`);
    doc.text(20,40, `Telefono: ${telefono}`);
    doc.text(20,50, `Direccion: ${direccion}`);
    doc.text(20,60, `Correo: ${correo}`);

    const pdfBlob = doc.output('blob');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = 'factura.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

 async function generarPDFBase64(nombre,apellido,documento,telefono,direccion,correo){
    const {jsPDF} = Window.jspdf;
    const doc = new jsPDF();
    doc.text(20,20, `Factura para ${nombre} ${apellido}`);
    doc.text(20,30, `Documento ${documento}`);
    doc.text(20,40, `Telefono: ${telefono}`);
    doc.text(20,50, `Direccion: ${direccion}`);
    doc.text(20,60, `Correo: ${correo}`);

    return doc.output('datauristring');
 }

 async function enviarFacturaPorCorreo(correo, pdfData, nombre, apellido){
    try{
        const response = await fetch('/api/enviar-factura',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({correo, pdfData, nombre, apellido})
        });
        if(!response.ok)throw new Error('Error al enviar factura');
        return await response.json();
    }catch (error){
        console.error('Error :', error);
    }
 }