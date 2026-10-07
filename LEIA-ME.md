# Site Maria Laís (A Mala)

Site estático, pronto para subir em qualquer hospedagem (Hostinger, Vercel, Netlify, cPanel). Basta enviar o conteúdo desta pasta para a raiz do domínio `marialais.com.br`.

## Estrutura

- `index.html`: a página inteira, com todo o conteúdo legível sem JavaScript (bom para o Google).
- `assets/css/style.css`: identidade visual (paleta, tipografia, layout e responsivo).
- `assets/js/main.js`: abertura com o logo, troca de cores no scroll, títulos animados, player de música, setlist interativo, galeria e formulário do WhatsApp.
- `assets/vendor/`: GSAP 3.15 (ScrollTrigger, SplitText) e Lenis, servidos localmente. Licenças em `LICENSES.txt`.
- `assets/fonts/`: Anton (títulos), JetBrains Mono (rótulos), Archivo (texto) e Bodoni Moda itálico (nome do DVD), Cormorant Garamond (letreiro A MALA), todas com licença OFL e servidas localmente.
- `assets/audio/`: áudio das faixas Traumatizou e Reinicia, extraído do DVD.
- `assets/video/`: vídeos gerados a partir das faixas 4K do DVD.
  - `intro-4k.mp4` (3840x2160) vai para telas grandes e retina; `intro-1080.mp4` é o padrão; `intro-720.mp4` vai para celular e conexão lenta. Se o 4K falhar, o site cai sozinho para o 1080.
  - Para forçar uma versão ao testar: `?q=4k` ou `?q=720` no fim do endereço.
- `assets/img/`: logo oficial em violão (`logo-branco.webp`, usado como máscara na abertura), letreiro "A MALA", frames do DVD em 4K escolhidos um a um (`card-*.webp` para as mais assistidas, `palco-*.webp` para a galeria, `exp-*.webp` para os formatos de show) e imagem de compartilhamento (`og-image.jpg`).
- `assets/video/prev-*.mp4`: prévias verticais de 5 segundos de cada card, recortadas das faixas 4K.
- `.claude/agents/`: os 11 agentes do projeto (identidade visual, branding, marketing, motion/UX, desenvolvimento, correções, plugins, terceiros, análise visual, cliente e revisor de design anti-IA).
- `_work/`: arquivos de trabalho da geração de mídia. Não precisa subir para a hospedagem.

## Seções

0. Preloader: contador 000 → 100 com as barras do logo enquanto o vídeo carrega (cerca de 2 segundos).
1. Abertura: o site começa com o logo oficial em forma de violão, com o vídeo 4K do DVD aparecendo por dentro. Ao rolar, a câmera entra pela barra do equalizador, o show toma a tela e surge o título "A voz de uma nova geração", com os botões "Ligar o som" e "Assistir ao DVD". Não há tela de entrada: a música liga no primeiro toque ou clique (o navegador exige um gesto) e pode ser pausada no botão ou no player.
2. Letreiro com os nomes das músicas, que acelera com o scroll.
3. A Mala: frases gigantes que correm com o scroll, com vídeos dentro do texto, citação e bio.
4. Números (+3 mi seguidores, +100 mi visualizações, 10 faixas, 41 min).
5. O DVD: quadro que cresce até a tela cheia (o nome "Mais ou Menos Assim" é o único lugar com a fonte serifada).
6. As mais assistidas do DVD, em ordem de visualizações no YouTube: 11 cards do mesmo tamanho, com foto e prévia em vídeo tiradas do DVD em 4K, e player embutido.
8. Formatos: seis cards de tela cheia que se empilham no scroll (Mala Móvel, Boteco Delivery, eventos privados, prefeituras, feiras e festivais, corporativo e marcas), cada um com botão que abre o WhatsApp com a mensagem pronta.
9. Galeria com 12 momentos do DVD em 4K (só fotos em que ela aparece bem), em duas faixas que correm em sentidos opostos; clique abre em tela cheia.
10. Redes sociais.
11. Contratação: pedido em 3 etapas (tipo de evento, cidade/data/público, contato) com prévia da mensagem e envio pelo WhatsApp, seguido dos contatos diretos.
12. Rodapé: letreiro "A MALA" em Cormorant Garamond, cor areia sólida, e os contatos abaixo.

Player flutuante de música: toca Traumatizou e Reinicia (part. Naessa) direto do DVD, com play/pausa, próxima, progresso e equalizador real. O logo da abertura e o equalizador gigante da seção de números reagem à música.

Player de vídeo próprio: os vídeos do YouTube abrem num player com a marca da Maria Laís (API oficial do YouTube sem os controles nativos). Tem play/pausa, barra de progresso com as marcas dos capítulos do DVD, volume, tela cheia, atalhos de teclado (espaço, setas, M, F) e a playlist das mais assistidas ao lado. A música do site pausa sozinha e volta ao fechar.

Identidade (v5): linguagem de cartaz de show, a partir da arte "Doeu, viu?". Títulos gigantes em Anton creme, palavra-chave em degradê dourado, rótulos em fonte mono com fios dourados e rótulos de canto em cada seção. Movimento: preloader, títulos por máscara, texto que decodifica, rastro de fotos no cursor (seção A Mala), equalizador que reage à música, coverflow nas mais assistidas, cards empilhados, cortina amarela antes da contratação e frases que inclinam com a velocidade do scroll.

## Para confirmar antes de publicar

- WhatsApp e e-mail de contratação: usei os do site antigo, (34) 98400-9272 e contato@marialais.com.br. O "Sobre" do YouTube mostra outro número, (34) 9 9894-6080.
- Números de redes (+3 mi seguidores, +100 mi visualizações): vieram das artes da agência.
- A ordem "mais assistidas" reflete o canal em outubro de 2026. Para atualizar, reordene os itens `<li class="card">` no `index.html`.

## Testar localmente

Abra um terminal nesta pasta e rode `python3 -m http.server 8000`, depois acesse http://localhost:8000. Abrir o `index.html` direto com duplo clique também funciona, mas alguns navegadores bloqueiam vídeos assim.

## Publicação

- GitHub (público): https://github.com/vitorhugofps/site-a-mala
- Vercel: projeto `site-a-mala` na conta gibson-mkt, no ar em https://site-a-mala.vercel.app
- Para o deploy automático a cada push, conecte o repositório em Vercel › site-a-mala › Settings › Git (instalando o app da Vercel no GitHub com acesso ao `site-a-mala`).
- Para usar marialais.com.br, adicione o domínio em Vercel › site-a-mala › Settings › Domains e aponte o DNS conforme a Vercel indicar.
