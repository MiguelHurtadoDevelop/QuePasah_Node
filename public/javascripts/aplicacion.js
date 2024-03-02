const socket = io();
    let usuario;
    let fotoPerfil;
    let registrado = false;
    let destinatarioPrivado;
    let mensajesPrivados = {};

    let url = "http://127.0.0.1:3000/";
    

    //Socket para mostrar cuando alguien se conecta a chat
    socket.on('entradaUsuario', (data) => {
        document.getElementById('general').innerHTML += `<li class="unido" > ${data.nick} se ha unido a la sala</li>`;
    });
  
    //Socket para mostrar cuando alguien sale del chat
    socket.on('salidaUsuario', (data) => {
        console.log(data)
        document.getElementById('general').innerHTML += `<li class="unido" > ${data.nick} ha salido la sala</li>`;
    });



    //Socket para mostrar los usuarios conectados
    socket.on('listaUsuarios', (usuarios) => {
      
        
        const userList = document.getElementById('userList');
  
        userList.innerHTML = ''; // Clear the previous list
  
        usuarios.forEach(user => {
  
          if (user.nick === usuario) return; // No mostrar el usuario actual en la lista
          const listItem = document.createElement('li');
  
          // Create an image element for the profile picture
          const profileImg = document.createElement('img');
          profileImg.src = url+`archivosCompartidos/${user.fotoPerfil}`;
          profileImg.style.width = '20px';
          profileImg.style.height = '20px';
          profileImg.style.borderRadius = '50%';
          listItem.appendChild(profileImg);
  
          // Add a space for better formatting
          listItem.appendChild(document.createTextNode(' '));
  
          // Create a span element for the username
          const usernameSpan = document.createElement('span');
          usernameSpan.textContent = user.nick;
          listItem.appendChild(usernameSpan);
  
          listItem.addEventListener('click', () => {
            iniciarChatPrivado(user.nick);
            console.log(`Clic en el usuario: ${user.nick}`);
          });
  
          userList.appendChild(listItem);
        });
    });


    //Función para mostrar el chat
    function mostrarChat() {
        document.getElementById('registro').style.display = 'none';
        document.getElementById('chat').style.display = 'block';
        document.getElementById('chatPrivado').style.display = 'none'; // Asegúrate de ocultar el chat privado
      }
  
      //Función para enviar mensajes
    function enviarMensaje() {
        const texto = document.getElementById('mensaje').value;
        document.getElementById('mensaje').value = '';
  
        const sala = document.getElementById('chatSelect').value;
        
  
        document.getElementById(sala).innerHTML += `<li class = "propio"> <img src="${document.getElementById('perfilImg').src}" style="width: 20px; height: 20px; border-radius: 50%;">${texto}</li>`;
  
        socket.emit('mensaje', { mensaje: texto, fotoPerfil: fotoPerfil, nick: usuario, sala: sala});
        escribiendoo = false;
        escribiendo();
      }


    //Socket para recibir mensajes
    socket.on('mensaje', (data) => {
        const color = data.esMiMensaje ? '' : 'color:red';
        
        document.getElementById(data.sala).innerHTML += `<li class = "recibido"><img src="${url}archivosCompartidos/${data.fotoPerfil}" style="width: 20px; height: 20px; border-radius: 50%;"> ${data.nick}: ${data.mensaje}</li>`;
      });
  
      
      //Socket para recibir archivos
      socket.on('subirArchivo', (data) => {
        const color = data.esMiMensaje ? '' : 'color:red';
        
        if (data.TipoFile.includes('image'))
          document.getElementById(data.sala).innerHTML += `<li class = "recibido"><img src="${url}archivosCompartidos/${data.fotoPerfil}" style="width: 20px; height: 20px; border-radius: 50%;"> ${data.nick}: <img  style="width: 100px;" src="${url}archivosCompartidos/${data.NombreFile}"></li>`;
        else {
          document.getElementById(data.sala).innerHTML += `<li class = "recibido"><img src="${url}archivosCompartidos/${data.fotoPerfil}" style="width: 20px; height: 20px; border-radius: 50%;"> ${data.nick}: <a download="${data.NombreFile}" href="${url}archivosCompartidos/${data.NombreFile}">${data.NombreFile}</a></li>`;
        }
  
      });
  
     
      //Función para subir archivos
  
      const uploadButton = document.getElementById('uploadButton');
      const fileInput = document.getElementById('fileInput');
      const endpoint = url+'upload';
      
      
      fileInput.addEventListener('change', () => {
        if (!registrado) {
          alert('Debes registrarte antes de usar el chat.');
          return;
        }
  
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const sala = document.getElementById('chatSelect').value;
  
        fetch(endpoint, {
          method: 'POST',
          body: formData
        })
          .then(data => {
            
            if (file.type.includes('image')) {
              document.getElementById(sala).innerHTML += `<li class = "propio" style="display: flex; align-items: center; width= 100px;"><img  src="${document.getElementById('perfilImg').src}" style="width: 20px; height: 20px; border-radius: 50%;"><img style="width: 100px;" src="${url}archivosCompartidos/${file.name}"</li>`;
  
            } else {
              document.getElementById(sala).innerHTML += `<li class = "propio" style="display: flex; align-items: center; width= 100px;"><img  src="${document.getElementById('perfilImg').src}" style="width: 20px; height: 20px; border-radius: 50%;"><a style="color: black; width: 100px;" download="${file.name}" href="${url}archivosCompartidos/${file.name}">${file.name}</a></li>`;
            }
  
            socket.emit('subirArchivo', { NombreFile: file.name, TipoFile: file.type, fotoPerfil: fotoPerfil, nick: usuario, sala: sala});
  
          })
          .catch(error => {
            console.error(error);
            
          });
      });
  

    

    //Función para mostrar el box de stickers
    let MostrandoStickers = false;
    function mostrarStickers() {
      if (MostrandoStickers) {
        document.getElementById('stickers').style.display = 'none';
        MostrandoStickers = false;
        return;
      }else{
        MostrandoStickers = true;
        document.getElementById('stickers').style.display = 'block';
      }
      
    }

    //Función para enviar stickers
    function enviarSticker(image) {
      const sala = document.getElementById('chatSelect').value;
      StickerPulsado = url+"images/"+image;
      
      document.getElementById(sala).innerHTML += '<li class = "propio" > <img src="' + document.getElementById('perfilImg').src + '"  style="width: 20px; height: 20px; border-radius: 50%;"> <img src="' + StickerPulsado + '" style="width: 100px;"></li>';
      socket.emit('enviarSticker', { src: StickerPulsado, fotoPerfil: fotoPerfil, nick: usuario, sala: sala});
    }

    //Socket para recibir stickers
    socket.on('enviarSticker', (data) => {
      const sala = document.getElementById('chatSelect').value;
      document.getElementById(sala).innerHTML += ` <li class = "recibido"><img src="${url}archivosCompartidos/${data.fotoPerfil}" style="width: 20px; height: 20px; border-radius: 50%;"> ${data.nick}: <img  style="width: 100px;" src="${data.src}"></li>`;
    });

    //Función para cambiar de sala
    document.getElementById('chatSelect').addEventListener('change', (event) => {
      const sala = event.target.value;

      document.getElementById('general').style.display = 'none';
      document.getElementById('noticias').style.display = 'none';
      document.getElementById('reuniones').style.display = 'none';
      document.getElementById(sala).style.display = 'flex';
      
    });

    //Función para iniciar chat privado
    function iniciarChatPrivado(destinatario) {
      document.getElementById('chatGeneral').style.display = 'none';
      document.getElementById('chatPrivadoTitle').innerText = `${destinatario}`;
      document.getElementById('chatPrivado').style.display = 'block';
      destinatarioPrivado = destinatario;

      // Limpiar el cuadro de chat privado
      const mensajesPrivadosDiv = document.getElementById('mensajesPrivados');
      mensajesPrivadosDiv.innerHTML = '';

      // Mostrar solo los mensajes del usuario correspondiente
      if (mensajesPrivados[destinatario]) {
        mensajesPrivados[destinatario].forEach(mensaje => {
          const messageDiv = document.createElement('li');
          messageDiv.className = 'recibido';
          messageDiv.textContent = ` ${mensaje.mensaje}`;
          mensajesPrivadosDiv.appendChild(messageDiv);
        });
      }
    }

    //Función para volver al chat general desde el chat privado
    function volverAlChat() {
        document.getElementById('chatGeneral').style.display = 'block';
        document.getElementById('chatPrivado').style.display = 'none';
      }

    //Socket para recibir mensajes privados
    socket.on('mensajePrivado', (mensaje) => {
      // Almacenar el mensaje
      if (!mensajesPrivados[mensaje.remite]) {
        mensajesPrivados[mensaje.remite] = [];
      }
      mensajesPrivados[mensaje.remite].push(mensaje);

      // Si el mensaje es del destinatario actual, actualizar la interfaz de usuario
      if (mensaje.remite === destinatarioPrivado) {
        const mensajesPrivadosDiv = document.getElementById('mensajesPrivados');
        const messageDiv = document.createElement('li');
        messageDiv.className = 'recibido';
        messageDiv.textContent = ` ${mensaje.mensaje}`;
        mensajesPrivadosDiv.appendChild(messageDiv);
      }
    });

    
    //Función para enviar mensajes privados
    function enviarMensajePrivado() {
      const mensajePrivadoInput = document.getElementById('mensajePrivado');
      const mensajePrivado = mensajePrivadoInput.value.trim();

      if (mensajePrivado !== '') {
      
        socket.emit('mensajePrivado', { destinatario: destinatarioPrivado, mensaje: mensajePrivado });
        document.getElementById('mensajesPrivados').innerHTML += `<li class = "propio"> ${mensajePrivado}</li>`;

        mensajePrivadoInput.value = '';
      }
    }

    //funcion para mostrar cuando un usuario esta escribiendo
    document.getElementById('mensaje').addEventListener('input', escribiendo);

    
    let escribiendoo;
    function escribiendo() {
        const sala = document.getElementById('chatSelect').value;
        if(document.getElementById('mensaje').value == ''){
            escribiendoo = false;
        }
        else{
            escribiendoo = true;
        }

        if (escribiendoo) {
            socket.emit('escribiendo', { usuario: usuario, sala: sala });
            escribiendoo = false;
        }else{
            socket.emit('noEscribiendo', { usuario: usuario, sala: sala });
            escribiendoo = true;
        }
      
    }

    //Socket para mostrar cuando un usuario esta escribiendo
    socket.on('escribiendo', (data) => {
      document.getElementById('escribiendo'+data.sala).innerText = `${data.usuario} está escribiendo...`;
    });

    //Socket para mostrar cuando un usuario deja de escribir
    socket.on('noEscribiendo', (data) => {
      document.getElementById('escribiendo'+data.sala).innerText = '';
    });

    
    //Función para loguearse en el chat
    function login() {
        usuario = document.getElementById('usuario').value;
        document.getElementById('usuario').value = '';
        const perfilImagen = document.getElementById('perfilImagen').files[0];
  
        if (perfilImagen && perfilImagen.type.includes('image')) {
          fotoPerfil = perfilImagen.name;
        } else {
          fotoPerfil = 'default_profile.jpg';
        }
  
        const formData = new FormData();
        formData.append('file', perfilImagen);
  
        fetch(url+'upload', {
          method: 'POST',
          body: formData
        })
          .then(data => {
            // Asigna la URL de la imagen después de cargar completamente
            perfilImg.onload = function () {
              // Código para mostrar la imagen después de cargar
              // En este caso, podrías hacer cualquier manipulación o mostrar la imagen en algún lugar
  
              // Asigna la URL de la imagen
            };
            perfilImg.src = `${url}archivosCompartidos/${fotoPerfil}`;
  
            socket.emit('nick', { usuario, fotoPerfil });
          })
          .catch(error => {
            console.error(error);
          });
  
        registrado = true;
        mostrarChat();
    }

    



    

    