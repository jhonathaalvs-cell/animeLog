let abaAtual = 'anime'; // Controla se estamos vendo anime ou manga

window.onload = () => {
    aplicarTemaSalvo();
    carregarMinhaLista();
};

function trocarAba(tipo) {
    abaAtual = tipo;
    
    // Atualiza botões
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(tipo)) btn.classList.add('active');
    });

    carregarMinhaLista();
}

function carregarMinhaLista() {
    const grid = document.getElementById('grid-minha-lista');
    const avisoVazio = document.getElementById('lista-vazia');
    const msgVazia = document.getElementById('msg-vazia');
    
    // Pega a lista completa
    let listaCompleta = JSON.parse(localStorage.getItem('minhaLista')) || [];

    // FILTRA apenas o que pertence à aba atual
    // Nota: Para isso funcionar, o seu salvarNaLista() precisa enviar o campo 'tipo' (anime ou manga)
    let listaFiltrada = listaCompleta.filter(item => item.tipo === abaAtual);

    if (listaFiltrada.length === 0) {
        grid.innerHTML = "";
        avisoVazio.classList.remove('hidden');
        msgVazia.innerText = `Sua lista de ${abaAtual}s está vazia.`;
        return;
    }

    avisoVazio.classList.add('hidden');
    grid.innerHTML = "";

    listaFiltrada.forEach((item) => {
        grid.innerHTML += `
            <div class="card card-lista">
                <div class="nota-badge">⭐ ${item.nota}</div>
                <button class="btn-remover" onclick="removerDaLista('${item.id}')">&times;</button>
                
                <img src="${item.imagem}" onclick="window.location.href='destaque.html?id=${item.id}'">
                
                <div class="card-content">
                    <h4>${item.titulo}</h4>
                    <div class="comentario-box">
                        "${item.comentario || 'Sem comentários.'}"
                    </div>
                </div>
            </div>
        `;
    });
}

function removerDaLista(id) {
    let listaCompleta = JSON.parse(localStorage.getItem('minhaLista')) || [];
    // Remove pelo ID único
    listaCompleta = listaCompleta.filter(item => item.id != id);
    localStorage.setItem('minhaLista', JSON.stringify(listaCompleta));
    carregarMinhaLista();
}

// --- TEMA ---
function aplicarTemaSalvo() {
    const tema = localStorage.getItem('tema') || 'dark';
    document.documentElement.setAttribute('data-tema', tema);
    document.getElementById('btn-tema').innerText = tema === 'dark' ? "🌙" : "☀️";
}

function alternarTema() {
    const html = document.documentElement;
    const novoTema = html.getAttribute('data-tema') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-tema', novoTema);
    localStorage.setItem('tema', novoTema);
    document.getElementById('btn-tema').innerText = novoTema === 'dark' ? "🌙" : "☀️";
}