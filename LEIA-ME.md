# Site Maria Laís (A Mala)

Site estático, pronto para subir em qualquer hospedagem (Hostinger, Vercel, Netlify, cPanel). Basta enviar o conteúdo desta pasta para a raiz do domínio `marialais.com.br`.

## Estrutura

- `index.html`: a página inteira, com todo o conteúdo legível sem JavaScript (bom para o Google).
- `assets/css/style.css`: identidade visual (paleta, tipografia, layout e responsivo).
- `assets/js/main.js`: animações de scroll, player, setlist interativo, formatos de show, galeria e formulário do WhatsApp.
- `assets/vendor/`: GSAP 3.15 (ScrollTrigger, SplitText) e Lenis, servidos localmente. Licenças em `LICENSES.txt`.
- `assets/fonts/`: Archivo e Bodoni Moda itálico (licença OFL), servidas localmente.
- `assets/audio/`: áudio das faixas Traumatizou e Reinicia, extraído do DVD.
- `assets/video/`: vídeos gerados a partir das faixas 4K do DVD.
  - `intro-4k.mp4` (3840x2160) vai para telas grandes e retina; `intro-1080.mp4` é o padrão; `intro-720.mp4` vai para celular e conexão lenta. Se o 4K falhar, o site cai sozinho para o 1080.
  - Para forçar uma versão ao testar: `?q=4k` ou `?q=720` no fim do endereço.
- `assets/img/`: logos em camadas (arco, nome, barras), letreiro "A MALA", fotos de palco do DVD e imagem de compartilhamento (`og-image.jpg`).
- `.claude/agents/`: os 11 agentes do projeto (identidade visual, branding, marketing, motion/UX, desenvolvimento, correções, plugins, terceiros, análise visual, cliente e revisor de design anti-IA).
- `_work/`: arquivos de trabalho da geração de mídia. Não precisa subir para a hospedagem.

## Seções

1. Entrada: o visitante escolhe entrar com som ou sem som (o navegador só libera áudio depois de um clique).
2. Abertura: vídeo 4K do DVD com o título "A voz de uma nova geração"; ao rolar, o vídeo vira uma faixa de cinema e some, o logo cromado se desenha e termina na assinatura "MARIA LAÍS | A MALA".
3. A Mala: frases gigantes que correm com o scroll, com vídeos dentro do texto, citação e bio.
4. Números (+3 mi seguidores, +100 mi visualizações, 10 faixas, 41 min) e letreiro com as músicas.
5. O DVD: quadro que cresce até a tela cheia (o nome "Mais ou Menos Assim" é o único lugar com a fonte serifada).
6. As mais assistidas do DVD, em ordem de visualizações no YouTube, com prévia em vídeo e player embutido.
7. Setlist interativo: os 41 minutos em forma de onda; clicar abre o DVD no minuto da música.
8. Onde a Mala chega: lista dos formatos (Mala Móvel, Boteco Delivery, bares, eventos privados, marcas) com foto que segue o cursor; cada um abre o WhatsApp com a mensagem pronta.
9. Galeria de palco em preto e branco, que ganha cor no hover.
10. Redes sociais.
11. Contratação: pedido em 3 etapas (tipo de evento, cidade/data/público, contato) com prévia da mensagem e envio pelo WhatsApp.

Player flutuante: toca Traumatizou e Reinicia (part. Naessa) direto do DVD, com play/pausa, próxima, barra de progresso e equalizador real. As barras do logo reagem à música. A música pausa sozinha quando um vídeo do YouTube abre.

Paleta: preto, branco e chumbo/prata. Tipografia: Archivo expandido em peso máximo nos títulos e Archivo no texto.

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
