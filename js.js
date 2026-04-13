let paginaAtual = 1;
let tipoAtual = 'top'; 
let corpusAtual = 'anime'; 
let generoAtual = '';
let animesDestaque = [];
let indexDestaque = 0;

window.onload = () => {
    carregarDestaques(); 
};

// 1. CARREGAR DESTAQUE (Banner Rotativo)
async function carregarDestaques() {
    try {
        const res = await fetch('https://api.jikan.moe/v4/seasons/now?limit=5');
        const json = await res.json();
        animesDestaque = json.data;
        
        renderizarBanner();
        
        // Intervalo de 8 segundos para trocar o slide
        setInterval(() => {
            indexDestaque = (indexDestaque + 1) % animesDestaque.length;
            renderizarBanner();
        }, 8000);
    } catch (e) {
        console.error("Erro no destaque:", e);
    }
}

function renderizarBanner() {
    const anime = animesDestaque[indexDestaque];
    const container = document.getElementById('anime-destaque'); // ID corrigido
    if (!anime || !container) return;

    const midiaDestaque = anime.trailer.embed_url 
        ? `<iframe src="${anime.trailer.embed_url}?autoplay=0&mute=1" allowfullscreen style="width: 100%; height: 100%; border-radius: 10px; border: none; min-height: 300px;"></iframe>` 
        : `<img src="${anime.images.jpg.large_image_url}" style="width:100%; height:100%; object-fit:cover; border-radius:10px; min-height: 300px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">`;

    container.innerHTML = `
        <div class="destaque-container animate-fade">
            <div class="destaque-capa">
                <img src="${anime.images.jpg.large_image_url}" alt="Capa">
            </div>
            <div class="destaque-info">
                <span style="color: var(--cor-primaria); font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; margin-bottom: 10px;">🔥 DESTAQUE DA TEMPORADA</span>
                <h2>${anime.title}</h2>
                <p class="destaque-sinopse">${anime.synopsis ? anime.synopsis.substring(0, 200) + '...' : 'Sem sinopse disponível.'}</p>
                <button class="btn-primario" onclick="window.location.href='destaque.html?id=${anime.mal_id}'">Ver Detalhes</button>
            </div>
            <div class="destaque-media">
                ${midiaDestaque}
            </div>
        </div>
    `;
}

// 2. NAVEGAÇÃO E EXPLORAÇÃO
function mostrarSecao(corpus) {
    document.getElementById('secao-destaque').classList.add('hidden');
    document.getElementById('secao-explorar').classList.remove('hidden');
    document.getElementById('titulo-pagina-atual').innerText = corpus === 'anime' ? 'Explorar Animes' : 'Explorar Mangás';
    carregarConteudo(1, 'top', corpus);
}

function filtrar(tipo, corpus) {
    mostrarSecao(corpus);
    carregarConteudo(1, tipo, corpus);
}

async function carregarConteudo(page, type, corpus, genre = '') {
    paginaAtual = page; tipoAtual = type; corpusAtual = corpus; generoAtual = genre;
    
    const container = document.getElementById('container-cards');
    container.innerHTML = "<p>Carregando...</p>";

    let url = `https://api.jikan.moe/v4/${type}/${corpus}?page=${page}&limit=18`;
    if (genre) url = `https://api.jikan.moe/v4/${corpus}?genres=${genre}&page=${page}&limit=18&order_by=score&sort=desc`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        
        container.innerHTML = "";
        json.data.forEach(item => {
            const tituloLimpo = item.title.replace(/'/g, "\\'");
            
            container.innerHTML += `
                <div class="card">
                    <button class="btn-add-card" onclick="abrirModalAvaliacao(${item.mal_id}, '${tituloLimpo}')">+</button>
                    <img src="${item.images.jpg.image_url}" alt="${item.title}" onclick="window.location.href='destaque.html?id=${item.mal_id}'">
                    <div class="card-content">
                        <h4>${item.title}</h4>
                    </div>
                </div>
            `;
        });
        renderizarPaginacao(json.pagination);
    } catch (e) { container.innerHTML = "Erro ao carregar dados."; }
}

// 3. PAGINAÇÃO E BUSCA
function renderizarPaginacao(info) {
    const pagContainer = document.getElementById('paginacao');
    pagContainer.innerHTML = "";
    if (!info) return;

    const maxPaginas = Math.min(info.last_visible_page, 6);
    for (let i = 1; i <= maxPaginas; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === paginaAtual ? "btn-pag ativo" : "btn-pag";
        btn.onclick = () => {
            window.scrollTo({ top: 400, behavior: 'smooth' });
            carregarConteudo(i, tipoAtual, corpusAtual, generoAtual);
        };
        pagContainer.appendChild(btn);
    }
}

async function realizarBusca() {
    const query = document.getElementById('inputBusca').value;
    if (query.length < 3) return;

    document.getElementById('secao-destaque').classList.add('hidden');
    document.getElementById('secao-explorar').classList.remove('hidden');
    const container = document.getElementById('container-cards');
    container.innerHTML = "Buscando...";

    const res = await fetch(`https://api.jikan.moe/v4/${corpusAtual}?q=${query}&limit=18`);
    const json = await res.json();
    container.innerHTML = "";
    json.data.forEach(item => {
        const tituloLimpo = item.title.replace(/'/g, "\\'");
        container.innerHTML += `
            <div class="card">
                <button class="btn-add-card" onclick="abrirModalAvaliacao(${item.mal_id}, '${tituloLimpo}')">+</button>
                <img src="${item.images.jpg.image_url}" onclick="window.location.href='destaque.html?id=${item.mal_id}'">
                <div class="card-content"><h4>${item.title}</h4></div>
            </div>
        `;
    });
}

// 4. MODAIS E SALVAMENTO
function abrirModalAvaliacao(id, titulo) {
    document.getElementById('modal-avaliacao').classList.remove('hidden');
    document.getElementById('anime-info-modal').innerHTML = `Avaliando: <strong>${titulo}</strong>`;
    document.getElementById('nota-anime').value = ""; 
    document.getElementById('comentario-anime').value = "";
    document.getElementById('modal-avaliacao').dataset.animeId = id;
}

function salvarNaLista() {
    const id = document.getElementById('modal-avaliacao').dataset.animeId;
    const titulo = document.getElementById('anime-info-modal').innerText.replace('Avaliando: ', '');
    const nota = document.getElementById('nota-anime').value;
    const comentario = document.getElementById('comentario-anime').value;
    
    // Busca a imagem do card
    const btn = document.querySelector(`button[onclick*="${id}"]`);
    const cardImg = btn ? btn.parentElement.querySelector('img').src : "";

    const novoItem = { 
        id, 
        titulo, 
        nota: nota || "0", 
        comentario: comentario || "Sem comentário.", 
        imagem: cardImg,
        tipo: corpusAtual 
    };

    let minhaLista = JSON.parse(localStorage.getItem('minhaLista')) || [];
    if (minhaLista.some(item => item.id == id)) {
        alert("Este item já está na sua lista!");
        fecharModal();
        return;
    }

    minhaLista.push(novoItem);
    localStorage.setItem('minhaLista', JSON.stringify(minhaLista));
    alert("Adicionado com sucesso!");
    fecharModal();
}

function fecharModal() { document.getElementById('modal-avaliacao').classList.add('hidden'); }

window.onclick = function(event) {
    const modAval = document.getElementById('modal-avaliacao');
    if (event.target == modAval) fecharModal();
}

// 5. TEMA
function alternarTema() {
    const html = document.documentElement;
    const novoTema = html.getAttribute('data-tema') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-tema', novoTema);
    localStorage.setItem('tema', novoTema);
}