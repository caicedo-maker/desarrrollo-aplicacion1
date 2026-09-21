// ============================================
// BUSCADOR DE LIBROS - GOOGLE BOOKS API
// Búsqueda por título con filtro de fecha más antigua
// ============================================

// ⚠️ IMPORTANTE: Reemplaza esto con tu API Key de Google Books
const API_KEY = 'AIzaSyC6rKW8vW-Yc-UYKc4S4xemDejp7TB13zw';

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Script cargado correctamente');

    const formulario = document.getElementById('formulario-busqueda');
    const inputTermino = document.getElementById('termino');
    const contenedorResultados = document.getElementById('resultados');
    const estado = document.getElementById('estado');

    if (!formulario) {
        console.warn('⚠️ No se encontró el formulario.');
        return;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const busqueda = inputTermino.value.trim();
        if (!busqueda) {
            estado.textContent = 'Por favor, escribe un título para buscar.';
            return;
        }

        estado.textContent = `🔎 Buscando "${busqueda}"...`;
        contenedorResultados.innerHTML = '';

        try {
            // ============================================
            // PASO 1: Buscar en Google Books
            // Usamos "intitle:" para forzar que busque solo en el título
            // ============================================
            const query = `intitle:${encodeURIComponent(busqueda)}`;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40&key=${API_KEY}`;

            const respuesta = await fetch(url);
            if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

            const datos = await respuesta.json();
            const items = datos.items;

            if (!items || items.length === 0) {
                estado.textContent = `😕 No se encontraron libros con el título "${busqueda}".`;
                return;
            }

            // ============================================
            // PASO 2: Filtrar y ordenar por la fecha más antigua
            // ============================================
            const librosValidos = items
                .filter(item => item.volumeInfo && item.volumeInfo.publishedDate)
                .sort((a, b) => {
                    const fechaA = new Date(a.volumeInfo.publishedDate).getTime();
                    const fechaB = new Date(b.volumeInfo.publishedDate).getTime();
                    return fechaA - fechaB; // Orden ascendente (más antiguo primero)
                });

            if (librosValidos.length === 0) {
                estado.textContent = `😕 No se encontraron libros con fecha válida para "${busqueda}".`;
                return;
            }

            // El primer resultado ahora es el libro MÁS ANTIGUO
            const libro = librosValidos[0].volumeInfo;
            console.log('📖 Libro seleccionado:', libro.title, 'Fecha:', libro.publishedDate);

            // ============================================
            // PASO 3: Extraer los datos
            // ============================================
            const titulo = libro.title || 'Título desconocido';
            const subtitulo = libro.subtitle ? ` — ${libro.subtitle}` : '';
            const autores = libro.authors ? libro.authors.join(', ') : 'Autor desconocido';
            const fechaPublicacion = libro.publishedDate || 'Fecha desconocida';
            const editorial = libro.publisher || 'Editorial desconocida';
            const paginas = libro.pageCount ? `${libro.pageCount} páginas` : 'N/D';
            const idioma = libro.language ? libro.language.toUpperCase() : 'N/D';

            // Descripción
            let descripcion = libro.description || 'Sin descripción disponible.';
            if (descripcion.length > 700) {
                descripcion = descripcion.substring(0, 700) + '...';
            }

            // Portada (con mejor resolución)
            let portadaUrl = 'https://via.placeholder.com/300x450?text=Sin+Portada';
            if (libro.imageLinks) {
                // Preferimos "thumbnail" y le cambiamos el zoom para mejor calidad
                let img = libro.imageLinks.thumbnail || libro.imageLinks.smallThumbnail;
                if (img) {
                    // Forzamos HTTPS y mejor zoom
                    img = img.replace('http://', 'https://').replace('&zoom=1', '&zoom=2');
                    portadaUrl = img;
                }
            }

            const enlaceLibro = libro.infoLink || libro.previewLink || '#';

            // ============================================
            // PASO 4: Renderizar
            // ============================================
            estado.textContent = '';

            const tarjeta = document.createElement('div');
            tarjeta.className = 'libro-detalle';
            tarjeta.innerHTML = `
                <div class="libro-imagen">
                    <img src="${portadaUrl}" alt="Portada de ${titulo}">
                </div>
                <div class="libro-info">
                    <h2>${titulo}${subtitulo}</h2>
                    <p class="autor"><strong>✍️ Autor:</strong> ${autores}</p>
                    <p><strong>📅 Primera publicación:</strong> ${fechaPublicacion}</p>
                    <p><strong>🏢 Editorial:</strong> ${editorial}</p>
                    <p><strong>📄 Páginas:</strong> ${paginas}</p>
                    <p><strong>🌐 Idioma:</strong> ${idioma}</p>
                    <div class="descripcion">
                        <strong>📝 Descripción:</strong>
                        <p>${descripcion}</p>
                    </div>
                    <a href="${enlaceLibro}" target="_blank" rel="noopener" class="ver-mas">
                        Ver ficha completa en Google Books →
                    </a>
                </div>
            `;

            contenedorResultados.appendChild(tarjeta);

        } catch (error) {
            console.error('❌ Error al buscar libros:', error);
            estado.textContent = '❌ Ocurrió un error al buscar. Revisa la consola (F12).';
        }
    });
});