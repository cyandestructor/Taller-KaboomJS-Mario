/**
 * Definimos las capas de nuestro juego,
 * las objetos sólo pueden interactuar con
 * aquellos dentro de su misma capa.
 * 
 * En este caso tenemos dos: ui para los
 * marcadores (nivel, puntuación, etc.), obj
 * como la capa principal del juego.
 * 
 * Como segundo parámetro definimos obj como
 * la capa por defecto.
 */
layers([
  'ui',
  'obj'
], 'obj');

// Constantes globales para el nivel, puntaje, tiempo, etc.
const LEVEL = args.level ?? 0;
const SCORE = args.score ?? 0;
const TIMER = args.timer ?? 50;

/**
 * Arreglo de mapas. Cada elemento es el mapa de un
 * nivel.
 * 
 * Kaboom nos permite definir los mapas como un
 * arreglo de string donde cada caracter corresponde
 * a un objeto que podemos definir en la
 * configuración.
 */
const maps = [
  [
    '                              ',
    '                              ',
    '        ? ?                   ',
    '                              ',
    '                              ',
    '       b!b?b                  ',
    '                              ',
    '                          -+  ',
    '          g      g        []  ',
    'xxxxxxxxxxxxxxxxxxxx     xxxxx',
  ],
  [
    '*                            *',
    '*                            *',
    '*                            *',
    '*                            *',
    '*                            *',
    '*      ddd&d                 *',
    '*                *           *',
    '*              * *      -+   *',
    '*         g  * * *    g []   *',
    '##############################',
  ]
];

/**
 * Configuración del nivel.
 * 
 * Definimos el ancho y alto de cada elemento
 * del mapa determinado por un caracter.
 * 
 * Definimos qué objeto corresponde a cada
 * caracter de los mapas previamente definidos.
 */
const levelConfig = {
  width: 20,
  height: 20,
  'x': [
    sprite('block'), // Sprite del objeto, usamos el id del asset cargado
    solid(), // Definimos el objeto como sólido
    'block' // Le otorgamos una etiqueta
  ],
  'b': [
    sprite('brick'),
    solid(),
    'block'
  ],
  '?': [
    sprite('question'),
    solid(),
    // Podemos poner más de una etiqueta a un objeto
    'coin-question-block',
    'block'
  ],
  '!': [
    sprite('question'),
    solid(),
    'mushroom-question-block',
    'block'
  ],
  '[': [
    sprite('pipe-left'),
    solid(),
    'block'
  ],
  ']': [
    sprite('pipe-right'),
    solid(),
    'block'
  ],
  '-': [
    sprite('pipe-top-left-side'),
    solid(),
    'pipe',
    'block'
  ],
  '+': [
    sprite('pipe-top-right-side'),
    solid(),
    'pipe',
    'block'
  ],
  'g': [
    sprite('goomba'),
    'goomba',
    // Le podemos otorgar atributos al objeto
    // Luego podremos acceder a ellos así:
    // obj.atributo
    {
      dir: -1
    }
  ],
  'o': [
    sprite('unboxed'),
    solid(),
    'block'
  ],
  '$': [
    sprite('coin'),
    'coin'
  ],
  'm': [
    sprite('mushroom'),
    body(), // El objeto será afectado por la gravedad
    'mushroom'
  ],
  '*': [
    sprite('blue-steel'),
    solid(),
    'block'
  ],
  'd': [
    sprite('blue-brick'),
    solid(),
    'block'
  ],
  '#': [
    sprite('blue-block'),
    solid(),
    'block'
  ],
  '&': [
    sprite('blue-question'),
    solid(),
    'coin-question-block',
    'block'
  ]
};

// Agregamos ahora sí el nivel a la escena.
// Primero el mapa y luego la configuración
const gameLevel = addLevel(maps[LEVEL], levelConfig);

// UI

// Objeto que mostrará el nivel y la puntuación del jugador
const levelInfo = add([
  // Agregamos un texto al objeto
  text('Level: ' + (LEVEL + 1) + ' Score: ' + SCORE),
  // Le asignamos una posición al objeto
  pos(20, 20),
  // Determinamos en qué capa colocar el objeto
  layer('ui'),
  {
    level: LEVEL // Guarda el nivel actual
  }
]);

// Objeto que controla y muestra el tiempo total
const timerInfo = add([
  text('Time: ' + TIMER.toFixed(2)),
  // Lo colocamos cerca del objeto anterior
  pos(levelInfo.pos.x, levelInfo.pos.y + 20),
  layer('ui'),
  {
    timer: TIMER // Controla el tiempo restante
  }
]);

// Player

// Constantes para controlar el movimiento del personaje
const MOVE_SPEED = 120;
const JUMP_FORCE = 415;

// Creamos un componente para un objeto
// Luego podemos asignarle el componente a cualquier objeto
function big() {
  // Podemos tener atributos internos del componente
  let timer = 0;
  let isBig = false;
  
  /**
   * Regresamos un objeto de JS con las funciones
   * que obtendrá cualquier objeto al que le
   * asignemos el componente
   */
  return {
    // Actualiza constantemente el componente
    // Debe llamarse update por sintaxis de Kaboom
    update() {
      // Mientras sea grande
      if(isBig){
        timer -= dt(); // Disminuimos el cronómetro interno
        // Si el tiempo de ser grande se acaba
        if(timer <= 0){
          this.smallify(); // Hacemos el objeto pequeño
        }
      }
    },
    smallify() {
      this.scale = vec2(1); // Regresar el objeto a su escala original
      timer = 0; // Poner el cronómetro en cero
      isBig = false; // Volvemos isBig a false porque ahora es pequeño
      // El bonus de salto al personaje es 1, significa que el bonus ya no afectará el salto
      this.jumpBonus = 1;
    },
    bigify(t) {
      this.scale = vec2(1.75); // Escalamos el objeto un 75% más grande
      timer = t; // Inicializamos el cronómetro interno de acuerdo al parámetro
      isBig = true; // Ahora el personaje es grande!
      this.jumpBonus = 1.25; // Le damos un bonus de salto de +25%
    }
  }
}

// Podemos crear funciones a nuestra conveniencia
// Función para aumentar el puntaje
// Recibimos p (player) como parámetro
function addScore(p) {
  p.score++; // Aumentamos el score del jugador
  // Mostramos el nivel y el puntaje actualizado
  levelInfo.text = 'Level: ' + (LEVEL + 1) + ' Score: ' + p.score;
}

// Definimos nuestro player
const player = add([
  sprite('mario'),
  pos(40, 160),
  body(),
  // Cambiamos el origen del objeto para que sea bottom o la parte baja del sprite
  origin('bot'),
  // Le asignamos nuestro componente custom al jugador
  big(),
  'player',
  {
    jumpBonus: 1,
    score: SCORE
  }
]);

function lose(p) {
  // Con go podemos cambiar de escena (scene)
  // Le podemos mandar parámetros a la escena, en este caso el score del jugador
  go('gameover', {
    score: p.score
  });
}

/**
 * Tenemos funciones para recibir el input del teclado. En este caso para las teclas a y d para controlar al jugador y espacio para que salte.
 */
keyDown('d', () => {
  // Con move() podemos mover un objeto tantos
  // pixeles en X y en Y
  player.move(MOVE_SPEED, 0);
});

keyDown('a', () => {
  player.move(-MOVE_SPEED, 0);
});

keyPress('space', () => {
  /**
   * grounded() y jump() vienen por defecto
   * con el componente body()
   * 
   * grounded nos dice si el objeto tocó el suelo
   * en el último frame.
   * 
   * jump hace saltar el objeto
   * 
   * Al hacer la condicional nos permite que
   * el pesonaje sólo pueda saltar cuando ya
   * tocó el suelo, evitando un salto infinito.
   */
  if(player.grounded()){
    player.jump(JUMP_FORCE * player.jumpBonus);
  }
});

/**
 * Con action podemos crear una rutina que se
 * ejecuta frame con frame.
 */
player.action(() => {
  // Revisamos constantemente la posición en y del jugador
  if(player.pos.y > 250){
    // Si sobrepasa cierto límite, pierde
    lose(player);
  }
});

// Timer

timerInfo.action(() => {
  // Vamos decrementando el tiempo segundo a segundo
  timerInfo.timer -= dt();
  if(timerInfo.timer <= 0){
    lose(player); // Pierde si se acaba el tiempo
  }else{
    // Vamos actualizando el tiempo en pantalla
    timerInfo.text = 'Time: ' + timerInfo.timer.toFixed(2);
  }
});

// Goombas

const GOOMBA_SPEED = 50;

// Asignamos una acción a todos los objetos con la etiqueta goomba
action('goomba', (g) => {
  // El goomba se mueve en una dirección
  g.move(GOOMBA_SPEED * g.dir, 0);
  // Si se sale de la pantalla, el goomba desaparece
  if(g.pos.x < -30){
    // Con destroy podemos desaparecer objetos del juego
    destroy(g);
  }
});

/**
 * Con overlaps podemos determinar una Función que
 * se ejecuta cuando un objeto con etiqueta player,
 * se superpone con otro objeto con la etiqueta goomba
 */
overlaps('player', 'goomba', (p, g) => {
  // Si el jugador no ha tocado el suelo, es decir, está en el aire
  if(!p.grounded()){
    // Agrega un punto al score
    addScore(p);
    // Destruye el goomba :(
    destroy(g);
  }
  else{
    // Si no, es decir, si el jugador está en el suelo
    lose(p); // Pierde frente al goomba :o
  }
});

overlaps('goomba', 'block', (g, b) => {
  // Si el goomba toca un bloque, cambia de dirección
  g.dir *= -1;
});

// Coin question block

/**
 * Con on podemos determinar una acción que se
 * realiza ante cierto evento.
 * 
 * En este caso el evento headbump que ya viene por
 * defecto cuando un objeto choca por la parte de arriba.
 * 
 * La función recibe el objeto que se chocó, en este,
 * con nuestro personaje.
 */
player.on('headbump', (obj) => {
  // Con is podemos preguntar si un objeto tiene cierta etiqueta
  // Si el objeto es una caja de moneda
  if(obj.is('coin-question-block')){
    /**
     * Aparecemos una moneda, determinada por $ en
     * la configuración del nivel.
     * 
     * Usamos la posición del objeto en la malla
     * del nivel para ponerlo arriba
     */
    gameLevel.spawn('$', obj.gridPos.sub(0, 1));
    /**
     * Además aparecemos una caja bloqueada,
     * representada por una o, en la misma posición
     * del objeto que se golpeó.
     */
    gameLevel.spawn('o', obj.gridPos.sub(0, 0));
    // Destruimos la caja de moneda para que solo quede la bloqueada
    destroy(obj);
  }
});

// Coin

// Al entrar en contacto con una moneda
overlaps('player', 'coin', (p, c) => {
  addScore(p); // Agregamos un punto al pesonaje
  destroy(c); // Destruimos la moneda
});

// Mushroom

const MUSHROOM_SPEED = 60;

action('mushroom', (m) => {
  /**
   * Cuando aparece un champiñon, se mueve
   * constantemente hacia la derecha
   */
  m.move(MUSHROOM_SPEED, 0);
});

// Al chocar con una caja de champiñon
player.on('headbump', (obj) => {
  // Funciona igual que la caja de moneda, pero aparece un champiñon en vez de una moneda
  if(obj.is('mushroom-question-block')){
    gameLevel.spawn('m', obj.gridPos.sub(0, 1));
    gameLevel.spawn('o', obj.gridPos.sub(0, 0));
    destroy(obj);
  }
});

/**
 * Collides funciona parecido a overlaps, pero
 * se activa cuando hay un contacto, incluso
 * si no se superponen.
 */

// Cuando el jugador entra en contacto con un champiñon
collides('player', 'mushroom', (p, c) => {
  addScore(p); // Agrega un punto
  p.bigify(10); // Hace al personaje grande por 10s
  destroy(c); // Destruye el champiñon
});

// Go to level

// Cuando el jugador entra en contacto con una tubería
collides('player', 'pipe', (player, pipe) => {
  // Si el jugador presiona s (hacia abajo)
  keyPress('s', () => {
    // Se carga la misma escena pero con el mapa del siguiente nivel
    go('main', {
      // Se le envía a la escena la puntuación, el nivel y el tiempo
      score: player.score,
      /**
       * Al hacer esta operación, si el siguiente
       * nivel no existe dentro de los mapas del
       * arreglo inicial, entonces nos regresa al
       * primer mapa. Así evitamos errores.
       */
      level: (levelInfo.level + 1) % maps.length,
      timer: timerInfo.timer
    });
  });
});