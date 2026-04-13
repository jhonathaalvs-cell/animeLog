// Variáveis para controlar qual anime estamos avaliando no momento
let animeSendoAvaliado = null;

// --- NOVA FUNÇÃO PARA O BOTÃO EXPLORAR ---
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

    // Define a URL da API baseada no filtro selecionado
    let url = '';
    if (tipo === 'top') {
        url = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=15';
    } else if (tipo === 'temporada') {
        url = 'https://api.jikan.moe/v4/seasons/now?limit=15';
    } else if (tipo === 'nota') {
        url = 'https://api.jikan.moe/v4/top/anime?filter=favorite&limit=15';
    }

    try {
        const response = await fetch(url);
        const result = await response.json();
        const animes = result.data;

        container.innerHTML = ""; 

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Limpa aspas do título para não quebrar o HTML do botão
            const tituloLimpo = anime.title.replace(/'/g, "\\'");

            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}">
                <h4>${anime.title}</h4>
                <p style="color: #f7f700; font-weight: bold;">★ ${anime.score || 'N/A'}</p>
                <button onclick="abrirModal('${tituloLimpo}', '${anime.images.jpg.image_url}')">Adicionar</button>
            `;
            container.appendChild(card);
        });

        // Fecha o menu de filtros após a escolha
        const menu = document.getElementById('filtros-menu');
        if (menu) menu.classList.add('hidden');

    } catch (erro) {
        console.error("Erro ao carregar populares:", erro);
        container.innerHTML = "<p>Erro ao carregar dados. Tente novamente.</p>";
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
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${termo}&limit=8`);
        const result = await response.json();
        const animes = result.data;

        container.innerHTML = ""; 

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const tituloTratado = anime.title.replace(/'/g, "\\'");

            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}">
                <h4>${anime.title}</h4>
                <button onclick="abrirModal('${tituloTratado}', '${anime.images.jpg.image_url}')">Adicionar</button>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao buscar:", erro);
        container.innerHTML = "Erro ao carregar animes.";
    }
}

// 3. FUNÇÕES DO MODAL (Abrir e Fechar)
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

// 4. SALVAR NA LISTA (LocalStorage)
function salvarNaLista() {
    const nota = document.getElementById('nota-input').value;
    const comentario = document.getElementById('comentario-input').value;

    if (!nota) return alert("Dê uma nota antes de salvar!");

    const novoItem = {
        ...animeSendoAvaliado,
        nota,
        comentario
    };

    const listaAtual = JSON.parse(localStorage.getItem('meusAnimes')) || [];
    listaAtual.push(novoItem);
    localStorage.setItem('meusAnimes', JSON.stringify(listaAtual));

    fecharModal();
    renderizarLista();
}

// 5. MOSTRAR A LISTA PESSOAL NA TELA
function renderizarLista() {
    const containerLista = document.getElementById('minha-lista');
    const listaSalva = JSON.parse(localStorage.getItem('meusAnimes')) || [];
    
    containerLista.innerHTML = "";

    listaSalva.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.imagem}">
            <h4>${item.titulo}</h4>
            <p>⭐ Sua Nota: ${item.nota}</p>
            <p style="font-size: 12px; padding: 5px; color: #ccc;">"${item.comentario}"</p>
            <button onclick="removerItem(${index})" style="background: #444; color: white;">Remover</button>
        `;
        containerLista.appendChild(card);
    });
}

// 6. REMOVER ITEM DA LISTA
function removerItem(index) {
    let lista = JSON.parse(localStorage.getItem('meusAnimes'));
    lista.splice(index, 1);
    localStorage.setItem('meusAnimes', JSON.stringify(lista));
    renderizarLista();
}

// 7. TEMA (Modo Noturno/Claro)
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

// 8. INICIALIZAÇÃO
window.onload = () => {
    renderizarLista();
    carregarPopulares('top');
    
    const temaSalvo = localStorage.getItem('tema');
    const checkbox = document.getElementById('btn-tema');
    const label = document.getElementById('tema-label');

    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-tema', 'dark');
        if (checkbox) checkbox.checked = true;
        if (label) label.innerText = "☀️";
    }
};