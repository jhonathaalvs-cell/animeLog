let paginaAtual = 1;
let tipoAtual = 'top';
let corpusAtual = 'anime';
let generoAtual = '';
let listaDestaque = [];
let indexDestaque = 0;

// Inicialização
window.onload = () => {
    aplicarTemaSalvo();
    iniciarCarrossel();
    carregarConteudo(1, 'top', 'anime');
};

// --- TEMA ---
function alternarTema() {
    const html = document.documentElement;
    const novoTema = html.getAttribute('data-tema') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-tema', novoTema);
    localStorage.setItem('tema', novoTema);
}

function aplicarTemaSalvo() {
    const salvo = localStorage.getItem('tema') || 'dark';
    document.documentElement.setAttribute('data-tema', salvo);
}

// --- CARROSSEL (Destaque) ---
async function iniciarCarrossel() {
    const res = await fetch('https://api.jikan.moe/v4/seasons/now?limit=5');
    const json = await res.json();
    listaDestaque = json.data;
    renderDestaque();
    setInterval(() => {
        indexDestaque = (indexDestaque + 1) % listaDestaque.length;
        renderDestaque();
    }, 7000);
}

function renderDestaque() {
    const item = listaDestaque[indexDestaque];
    if(!item) return;
    document.getElementById('anime-destaque').innerHTML = `
        <div class="destaque-info">
            <h2>${item.title}</h2>
            <p>${item.synopsis ? item.synopsis.substring(0, 160) + '...' : ''}</p>
            <button onclick="window.location.href='detalhes.html?id=${item.mal_id}'">Mais Detalhes</button>
        </div>
        <div class="destaque-video">
            ${item.trailer.embed_url ? `<iframe src="${item.trailer.embed_url}?autoplay=0&mute=1"></iframe>` : `<img src="${item.images.jpg.large_image_url}">`}
        </div>
    `;
}

// --- CONTEÚDO E PAGINAÇÃO ---
async function carregarConteudo(page, type, corpus, genre = '') {
    paginaAtual = page; tipoAtual = type; corpusAtual = corpus; generoAtual = genre;
    const container = document.getElementById('container-cards');
    container.innerHTML = "Carregando...";

    let url = `https://api.jikan.moe/v4/${type}/${corpus}?page=${page}&limit=15`;
    if(genre) url = `https://api.jikan.moe/v4/${corpus}?genres=${genre}&page=${page}&limit=15&order_by=score&sort=desc`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        container.innerHTML = "";
        json.data.forEach(anim => {
            container.innerHTML += `
                <div class="card" onclick="window.location.href='detalhes.html?id=${anim.mal_id}'">
                    <img src="${anim.images.jpg.image_url}">
                    <h4>${anim.title}</h4>
                </div>
            `;
        });
        renderPaginacao(json.pagination);
    } catch(e) { container.innerHTML = "Erro ao carregar."; }
}

function renderPaginacao(info) {
    const pag = document.getElementById('paginacao');
    pag.innerHTML = "";
    const total = Math.min(info.last_visible_page, 5); // Mostra até 5 botões
    for(let i=1; i<=total; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === paginaAtual ? "btn-pag ativo" : "btn-pag";
        btn.onclick = () => {
            window.scrollTo({top: 400, behavior: 'smooth'});
            carregarConteudo(i, tipoAtual, corpusAtual, generoAtual);
        };
        pag.appendChild(btn);
    }
}

// --- CATEGORIAS ---
async function abrirGeneros(corpus) {
    const modal = document.getElementById('modal-generos');
    const lista = document.getElementById('lista-generos');
    modal.classList.remove('hidden');
    lista.innerHTML = "Buscando...";
    const res = await fetch(`https://api.jikan.moe/v4/genres/${corpus}`);
    const json = await res.json();
    lista.innerHTML = "";
    json.data.forEach(g => {
        const b = document.createElement('button');
        b.innerText = g.name;
        b.onclick = () => {
            fecharModalGeneros();
            carregarConteudo(1, 'anime', corpus, g.mal_id);
            document.getElementById('titulo-sessao').innerText = g.name;
        };
        lista.appendChild(b);
    });
}

function fecharModalGeneros() { document.getElementById('modal-generos').classList.add('hidden'); }
function mudarPagina(p, t, c) { carregarConteudo(p, t, c); }