// Variáveis para controlar qual anime estamos avaliando no momento
let animeSendoAvaliado = null;

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
    sessaoBusca.classList.remove('hidden');

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${termo}&limit=8`);
        const result = await response.json();
        const animes = result.data;

        container.innerHTML = ""; 

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // CORREÇÃO AQUI: Tratamento para títulos com aspas simples
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
            <button onclick="removerItem(${index})" style="background: #444">Remover</button>
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

// 7. INICIALIZAÇÃO
// Quando a página carrega, mostra a lista salva e carrega os populares por padrão
window.onload = () => {
    renderizarLista();
    carregarPopulares('top');
};

function alternarTema() {
    const html = document.documentElement; // Pega o <html> do site
    const botao = document.getElementById('btn-tema');
    
    // Verifica qual o tema atual e troca
    if (html.getAttribute('data-tema') === 'dark') {
        html.removeAttribute('data-tema');
        botao.innerText = "Modo Noturno";
        localStorage.setItem('tema', 'light');
    } else {
        html.setAttribute('data-tema', 'dark');
        botao.innerText = "Modo Claro";
        localStorage.setItem('tema', 'dark');
    }
}

// Verifica se o usuário já tinha escolhido um tema antes de carregar a página
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-tema', 'dark');
        document.getElementById('btn-tema').innerText = "Modo Claro";
    }
    // Suas outras funções de carregar populares aqui...
});