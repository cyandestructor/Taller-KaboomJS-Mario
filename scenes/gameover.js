// Agregamos un texto central que nos muestra la puntación
add([
  text(args.score),
  origin('center'),
  pos(width()/2, height()/2),
  scale(10)
]);

// Agregamos un texto que nos indica cómo reiniciar
add([
  text('Press R to restart'),
  origin('center'),
  pos(width()/2, height()/2 + 100),
  scale(2)
]);

// Si se presiona r, reiniciamos el juego
keyPress('r', () => {
  go('main');
});