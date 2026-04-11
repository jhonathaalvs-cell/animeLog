// Variáveis para controlar qual anime estamos avaliando no momento
let animeSendoAvaliado = null;

// 1. FUNÇÃO DE BUSCA (Conecta com a API Jikan)
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

        container.innerHTML = ""; // Limpa o carregando

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}">
                <h4>${anime.title}</h4>
                <button onclick="abrirModal('${anime.title}', '${anime.images.jpg.image_url}')">Adicionar</button>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao buscar:", erro);
    }
}

// 2. FUNÇÕES DO MODAL (Abrir e Fechar)
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

// 3. SALVAR NA LISTA (LocalStorage)
function salvarNaLista() {
    const nota = document.getElementById('nota-input').value;
    const comentario = document.getElementById('comentario-input').value;

    if (!nota) return alert("Dê uma nota antes de salvar!");

    // Cria o objeto do anime com a sua avaliação
    const novoItem = {
        ...animeSendoAvaliado,
        nota,
        comentario
    };

    // Pega a lista que já existe ou cria uma vazia
    const listaAtual = JSON.parse(localStorage.getItem('meusAnimes')) || [];
    
    // Adiciona o novo anime na lista
    listaAtual.push(novoItem);
    
    // Salva de volta no navegador
    localStorage.setItem('meusAnimes', JSON.stringify(listaAtual));

    fecharModal();
    renderizarLista();
}

// 4. MOSTRAR A LISTA NA TELA
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
            <p>⭐ Nota: ${item.nota}</p>
            <p style="font-size: 12px; padding: 5px;">"${item.comentario}"</p>
            <button onclick="removerItem(${index})" style="background: #666">Remover</button>
        `;
        containerLista.appendChild(card);
    });
}

// 5. REMOVER ITEM
function removerItem(index) {
    let lista = JSON.parse(localStorage.getItem('meusAnimes'));
    lista.splice(index, 1);
    localStorage.setItem('meusAnimes', JSON.stringify(lista));
    renderizarLista();
}

// Carregar a lista assim que abrir a página
window.onload = renderizarLista;