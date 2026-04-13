async function carregarDetalhes() {
    // 1. Pega o ID do anime que está na URL (ex: detalhes.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');

    if (!animeId) {
        window.location.href = 'index.html'; // Volta se não tiver ID
        return;
    }

    const container = document.getElementById('conteudo-detalhes');

    try {
        // 2. Busca os dados completos na API
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
        const result = await response.json();
        const anime = result.data;

        // 3. Monta o HTML com os dados da API usando seu design
        container.innerHTML = `
            <div class="detalhe-wrapper">
                <div class="topo-detalhe">
                    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                    <div class="info-principal">
                        <h2>${anime.title}</h2>
                        <div class="status-info">
                            <span class="nota">★ ${anime.score || 'N/A'}</span>
                            <span class="ano">${anime.year || ''} | ${anime.status}</span>
                        </div>
                        <div class="generos">
                            ${anime.genres.map(g => `<span class="tag-genero">${g.name}</span>`).join('')}
                        </div>
                        <p class="sinopse"><strong>Sinopse:</strong><br>${anime.synopsis || 'Sem sinopse disponível.'}</p>
                    </div>
                </div>

                ${anime.trailer.embed_url ? `
                    <div class="sessao-trailer">
                        <h3>Trailer Oficial</h3>
                        <div class="video-container">
                            <iframe src="${anime.trailer.embed_url}" allowfullscreen></iframe>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

    } catch (erro) {
        container.innerHTML = "<h2>Erro ao carregar detalhes do anime.</h2>";
    }
}

// Garante que o modo escuro funcione aqui também
function aplicarTemaSalvo() {
    if (localStorage.getItem('tema') === 'dark') {
        document.documentElement.setAttribute('data-tema', 'dark');
    }
}

window.onload = () => {
    aplicarTemaSalvo();
    carregarDetalhes();
};