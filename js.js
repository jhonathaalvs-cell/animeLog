// Variáveis para controlar qual anime estamos avaliando no momento
let animeSendoAvaliado = null;

// --- FUNÇÃO PARA O BOTÃO EXPLORAR (ABRIR/FECHAR MENU) ---
function toggleFiltros() {
    const menu = document.getElementById('filtros-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// 1. FUNÇÃO DE EXPLORAR/FILTROS (Populares, Temporada, Notas)
async function carregarPopulares(tipo = 'top') {
    const container = document.getElementById('container-populares');
    if (!container) return;

    container.innerHTML = "<p style='color: white;'>Carregando...</p>";

    let url = '';
    if (tipo === 'top') {
        url = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20';
    } else if (tipo === 'temporada') {
        url = 'https://api.jikan.moe/v4/seasons/now?limit=20';
    } else if (tipo === 'nota') {
        url = 'https://api.jikan.moe/v4/top/anime?filter=favorite&limit=20';
    }

    try {
        const response = await fetch(url);
        const result = await response.json();
        const animes = result.data;

        container.innerHTML = ""; 

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            const tituloTratado = anime.title.replace(/'/g, "\\'");

            // ALTERAÇÃO: Adicionado onclick na imagem para ir aos detalhes
            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}" 
                     onclick="window.location.href='detalhes.html?id=${anime.mal_id}'" 
                     style="cursor:pointer" title="Clique para ver detalhes">
                <h4>${anime.title}</h4>
                <p style="color: #f7f700; font-weight: bold;">★ ${anime.score || 'N/A'}</p>
                <button onclick="abrirModal('${tituloTratado}', '${anime.images.jpg.image_url}')">Adicionar</button>
            `;
            container.appendChild(card);
        });

        const menu = document.getElementById('filtros-menu');
        if (menu) menu.classList.add('hidden');

    } catch (erro) {
        container.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

// 2. FUNÇÃO DE BUSCA (Barra de Pesquisa)
async function buscarAnimes() {
    const termo = document.getElementById('inputBusca').value;
    if (termo.length < 3) return alert("Digite pelo menos 3 letras!");

    const container = document.getElementById('container-resultados');
    const sessaoBusca = document.getElementById('sessao-busca');
    
    container.innerHTML = "Carregando...";
    if (sessaoBusca) sessaoBusca.classList.remove('hidden');

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${termo}&limit=20`);
        const result = await response.json();
        const animes = result.data;

        container.innerHTML = ""; 

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            const tituloTratado = anime.title.replace(/'/g, "\\'");

            // ALTERAÇÃO: Adicionado onclick na imagem para ir aos detalhes
            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}" 
                     onclick="window.location.href='detalhes.html?id=${anime.mal_id}'" 
                     style="cursor:pointer" title="Clique para ver detalhes">
                <h4>${anime.title}</h4>
                <button onclick="abrirModal('${tituloTratado}', '${anime.images.jpg.image_url}')">Adicionar</button>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        container.innerHTML = "Erro ao carregar animes.";
    }
}

// 3. FUNÇÕES DO MODAL
function abrirModal(titulo, imagem) {
    animeSendoAvaliado = { titulo, imagem };
    document.getElementById('nome-anime-modal').innerText = titulo;
    document.getElementById('modal-avaliacao').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modal-avaliacao').classList.add('hidden');
    document.getElementById('nota-input').value = "";
    document.getElementById('comentario-input').value = "";
}

// 4. SALVAR NO LOCALSTORAGE
function salvarNaLista() {
    const nota = document.getElementById('nota-input').value;
    const comentario = document.getElementById('comentario-input').value;

    if (!nota) return alert("Dê uma nota antes de salvar!");

    const novoItem = { ...animeSendoAvaliado, nota, comentario };
    const listaAtual = JSON.parse(localStorage.getItem('meusAnimes')) || [];
    listaAtual.push(novoItem);
    localStorage.setItem('meusAnimes', JSON.stringify(listaAtual));

    fecharModal();
    renderizarLista();
}

// 5. RENDERIZAR LISTA PESSOAL
function renderizarLista() {
    const containerLista = document.getElementById('minha-lista');
    if (!containerLista) return;
    
    const listaSalva = JSON.parse(localStorage.getItem('meusAnimes')) || [];
    containerLista.innerHTML = "";

    listaSalva.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.imagem}">
            <h4>${item.titulo}</h4>
            <p>⭐ Nota: ${item.nota}</p>
            <p style="font-size: 11px; color:#ccc;">"${item.comentario}"</p>
            <button onclick="removerItem(${index})" style="background: #444; color:white;">Remover</button>
        `;
        containerLista.appendChild(card);
    });
}

function removerItem(index) {
    let lista = JSON.parse(localStorage.getItem('meusAnimes'));
    lista.splice(index, 1);
    localStorage.setItem('meusAnimes', JSON.stringify(lista));
    renderizarLista();
}

// 6. TEMA (DARK/LIGHT)
function alternarTema() {
    const html = document.documentElement;
    const checkbox = document.getElementById('btn-tema');
    const label = document.getElementById('tema-label');
    
    if (checkbox.checked) {
        html.setAttribute('data-tema', 'dark');
        label.innerText = "☀️";
        localStorage.setItem('tema', 'dark');
    } else {
        html.removeAttribute('data-tema');
        label.innerText = "🌙";
        localStorage.setItem('tema', 'light');
    }
}

// 7. INICIALIZAÇÃO
window.onload = () => {
    renderizarLista();
    carregarPopulares('top');
    
    const temaSalvo = localStorage.getItem('tema');
    const checkbox = document.getElementById('btn-tema');
    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-tema', 'dark');
        if(checkbox) checkbox.checked = true;
        const label = document.getElementById('tema-label');
        if(label) label.innerText = "☀️";
    }
};