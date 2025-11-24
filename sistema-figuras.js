// sistema-figuras.js

// === PATRÓN SINGLETON: CLASE VALIDADORA ===
/**
 * Clase que implementa el patrón Singleton para asegurar
 * que solo haya una instancia de la lógica de validación.
 */
class ValidadorParametros {
  static instance = null;

  /**
   * El constructor es privado para evitar instanciación externa.
   */
  constructor() {
    if (ValidadorParametros.instance) {
      return ValidadorParametros.instance;
    }
    ValidadorParametros.instance = this;
  }

  /**
   * Método estático para obtener la única instancia del Validador.
   * @returns {ValidadorParametros}
   */
  static getInstance() {
    if (!ValidadorParametros.instance) {
      ValidadorParametros.instance = new ValidadorParametros();
    }
    return ValidadorParametros.instance;
  }

  /**
   * Valida que el valor sea un número positivo y no nulo.
   * @param {*} valor - El valor a validar.
   * @param {string} nombreParametro - Nombre del parámetro para el mensaje de error.
   * @returns {number} - El valor validado.
   * @throws {Error} - Si el valor no es válido.
   */
  validarPositivo(valor, nombreParametro) {
    if (typeof valor !== 'number' || isNaN(valor) || valor <= 0) {
      throw new Error(`[VALIDACIÓN FALLIDA] ${nombreParametro} debe ser un número positivo (recibido: ${valor})`);
    }
    return valor;
  }
}

// Obtener la instancia del Validador (Singleton)
const validador = ValidadorParametros.getInstance();

// === CLASE BASE ABSTRACTA ===
class FiguraGeometrica {
  constructor(nombre) {
    this.nombre = nombre;
    this.#id = Math.random().toString(36).substr(2, 9);
  }

  // Propiedad privada
  #id;

  // Métodos abstractos (deben ser implementados por subclases)
  calcularArea() {
    throw new Error('Método calcularArea debe ser implementado por la subclase');
  }

  calcularPerimetro() {
    throw new Error('Método calcularPerimetro debe ser implementado por la subclase');
  }

  /**
   * Nuevo método abstracto para dibujar la figura en ASCII.
   * @returns {string} - Representación ASCII de la figura.
   */
  dibujarASCII() {
    return `[Representación ASCII no implementada para ${this.nombre}]`;
  }

  // Método común
  describir() {
    return `${this.nombre} (ID: ${this.#id}) - Área: ${this.calcularArea().toFixed(2)}, Perímetro: ${this.calcularPerimetro().toFixed(2)}`;
  }

  // Getter para ID
  get id() {
    return this.#id;
  }

  // Método estático para comparar similitud de figuras
  /**
   * Compara si dos figuras son "similares" (tienen las mismas dimensiones
   * o una relación constante en sus dimensiones, ignorando el tipo).
   * Para figuras 2D, se comparan sus áreas y perímetros.
   * @param {FiguraGeometrica} figura1 - La primera figura.
   * @param {FiguraGeometrica} figura2 - La segunda figura.
   * @param {number} tolerancia - La tolerancia permitida para la comparación (por defecto 1e-6).
   * @returns {boolean} - True si son similares, False en caso contrario.
   */
  static esSimilar(figura1, figura2, tolerancia = 1e-6) {
    const area1 = figura1.calcularArea();
    const area2 = figura2.calcularArea();
    const perimetro1 = figura1.calcularPerimetro();
    const perimetro2 = figura2.calcularPerimetro();

    const areaSimilar = Math.abs(area1 - area2) < tolerancia;
    const perimetroSimilar = Math.abs(perimetro1 - perimetro2) < tolerancia;

    // Se consideran similares si sus áreas y perímetros son cercanos.
    return areaSimilar && perimetroSimilar;
  }

  // Método estático
  static crearDesdeJSON(jsonString) {
    const data = JSON.parse(jsonString);
    switch (data.tipo) {
      case 'circulo':
        return new Circulo(data.radio);
      case 'rectangulo':
        return new Rectangulo(data.ancho, data.alto);
      case 'triangulo':
        return new Triangulo(data.base, data.altura);
      case 'pentagono':
        return new Pentagono(data.lado);
      case 'cubo':
        return new Cubo(data.lado); // Puede crear 3D
      default:
        throw new Error('Tipo de figura no reconocido');
    }
  }
}

// === INTERFAZ (Clase Base) para Figuras 3D ===
/**
 * Clase que extiende FiguraGeometrica y añade la capacidad de calcular volumen.
 */
class Figura3D extends FiguraGeometrica {
  constructor(nombre) {
    super(nombre);
  }

  /**
   * Método abstracto para el cálculo de volumen.
   */
  calcularVolumen() {
    throw new Error('Método calcularVolumen debe ser implementado por la subclase');
  }

  // Sobrescribir describir para añadir volumen
  describir() {
    return `${super.describir()}, Volumen: ${this.calcularVolumen().toFixed(2)}`;
  }

  // El perímetro es el área de superficie total para 3D
  calcularPerimetro() {
    throw new Error('Para figuras 3D, use calcularAreaSuperficie() en lugar de calcularPerimetro()');
  }
}

// === IMPLEMENTACIONES DE FIGURAS 2D ===

class Circulo extends FiguraGeometrica {
  constructor(radio) {
    try {
      super('Círculo');
      this.radio = validador.validarPositivo(radio, 'Radio');
    } catch (e) {
      throw new Error(`Error al crear Círculo: ${e.message}`);
    }
  }
  calcularArea() {
    return Math.PI * this.radio * this.radio;
  }
  calcularPerimetro() {
    return 2 * Math.PI * this.radio;
  }
  calcularDiametro() {
    return this.radio * 2;
  }
  dibujarASCII() {
    const r = Math.round(this.radio);
    let ascii = '';
    // Representación simplificada de un círculo como un cuadrado para radios grandes
    if (r > 1) {
      for (let i = 0; i < r * 2; i++) {
        ascii += '*'.repeat(r * 2) + '\n';
      }
      return ascii.trim();
    }
    return '  *\n ***\n  *'; // Dibujo simple
  }
}

class Rectangulo extends FiguraGeometrica {
  constructor(ancho, alto) {
    try {
      super('Rectángulo');
      this.ancho = validador.validarPositivo(ancho, 'Ancho');
      this.altura = validador.validarPositivo(alto, 'Altura');
    } catch (e) {
      throw new Error(`Error al crear Rectángulo: ${e.message}`);
    }
  }
  calcularArea() {
    return this.ancho * this.altura;
  }
  calcularPerimetro() {
    return 2 * (this.ancho + this.altura);
  }
  esCuadrado() {
    return this.ancho === this.altura;
  }
  dibujarASCII() {
    const w = Math.round(this.ancho > 10 ? 10 : this.ancho);
    const h = Math.round(this.altura > 5 ? 5 : this.altura);
    let ascii = '';
    for (let i = 0; i < h; i++) {
      if (i === 0 || i === h - 1) {
        ascii += '+-' + '-'.repeat(w - 2) + '-+\n';
      } else {
        ascii += '| ' + ' '.repeat(w - 2) + ' |\n';
      }
    }
    return ascii.trim();
  }
}

class Triangulo extends FiguraGeometrica {
  constructor(base, altura, ladoB = base, ladoC = base) {
    try {
      super('Triángulo');
      this.base = validador.validarPositivo(base, 'Base');
      this.altura = validador.validarPositivo(altura, 'Altura');
      // Para perímetro real, se necesitan los otros lados. Simplificamos para equilátero/isósceles
      this.ladoB = validador.validarPositivo(ladoB, 'Lado B');
      this.ladoC = validador.validarPositivo(ladoC, 'Lado C');
    } catch (e) {
      throw new Error(`Error al crear Triángulo: ${e.message}`);
    }
  }
  calcularArea() {
    return (this.base * this.altura) / 2;
  }
  calcularPerimetro() {
    // Perímetro más exacto
    return this.base + this.ladoB + this.ladoC;
  }
  calcularHipotenusa() {
    // Para triángulo rectángulo con base y altura como catetos
    return Math.sqrt(this.base * this.base + this.altura * this.altura);
  }
  dibujarASCII() {
    const h = Math.round(this.altura > 5 ? 5 : this.altura);
    let ascii = '';
    for (let i = 1; i <= h; i++) {
      const espacios = ' '.repeat(h - i);
      const asteriscos = '*'.repeat(2 * i - 1);
      ascii += espacios + asteriscos + '\n';
    }
    return ascii.trim();
  }
}

/**
 * Nueva figura: Polígono regular de 5 lados.
 * Asume un Pentágono regular (todos los lados y ángulos iguales).
 */
class Pentagono extends FiguraGeometrica {
  constructor(lado) {
    try {
      super('Pentágono');
      this.lado = validador.validarPositivo(lado, 'Lado');
    } catch (e) {
      throw new Error(`Error al crear Pentágono: ${e.message}`);
    }
  }
  calcularArea() {
    // Fórmula para área de pentágono regular: (lado^2 * sqrt(25 + 10 * sqrt(5))) / 4
    return (this.lado * this.lado * Math.sqrt(25 + 10 * Math.sqrt(5))) / 4;
  }
  calcularPerimetro() {
    return 5 * this.lado;
  }
  dibujarASCII() {
    const s = Math.round(this.lado);
    // Dibujo muy simplificado
    if (s < 3) return ' /\ \n|  |\n \/ ';
    let ascii = '  /\\ \n /  \\ \n|    |\n \\  / \n  \\/';
    return ascii;
  }
}

/**
 * Nueva figura: Polígono regular de 6 lados.
 * Asume un Hexágono regular.
 */
class Hexagono extends FiguraGeometrica {
  constructor(lado) {
    try {
      super('Hexágono');
      this.lado = validador.validarPositivo(lado, 'Lado');
    } catch (e) {
      throw new Error(`Error al crear Hexágono: ${e.message}`);
    }
  }
  calcularArea() {
    // Fórmula para área de hexágono regular: (3 * sqrt(3) / 2) * lado^2
    return (3 * Math.sqrt(3) / 2) * this.lado * this.lado;
  }
  calcularPerimetro() {
    return 6 * this.lado;
  }
  dibujarASCII() {
    const s = Math.round(this.lado);
    // Dibujo muy simplificado
    if (s < 3) return ' __\n/  \\\n\\__/';
    let ascii = '  __\n /  \\\n|    |\n\\  /\n __';
    return ascii;
  }
}

// === IMPLEMENTACIÓN DE FIGURA 3D ===

/**
 * Figura 3D: Cubo.
 * Hereda de Figura3D para obtener la funcionalidad de volumen.
 */
class Cubo extends Figura3D {
  constructor(lado) {
    try {
      super('Cubo');
      this.lado = validador.validarPositivo(lado, 'Lado');
    } catch (e) {
      throw new Error(`Error al crear Cubo: ${e.message}`);
    }
  }

  // Área de la superficie total (6 caras cuadradas)
  calcularArea() {
    return 6 * this.lado * this.lado;
  }

  calcularVolumen() {
    return this.lado * this.lado * this.lado;
  }

  // Sobrescribir el método para cumplir con la herencia.
  calcularPerimetro() {
    // Se utiliza para la descripción, aunque geométricamente es el área superficial
    return this.calcularArea(); 
  }

  dibujarASCII() {
    let s = Math.round(this.lado > 5 ? 5 : this.lado);
    if (s < 2) return '[]';
    let ascii = '  .' + '-'.repeat(s) + '.\n';
    ascii += ' /' + ' '.repeat(s) + ' /|\n';
    ascii += '.' + '-'.repeat(s) + '. |\n';
    ascii += '|' + ' '.repeat(s) + '| .\n';
    ascii += '.' + '-'.repeat(s) + "'";
    return ascii;
  }
}

// === PATRÓN FÁBRICA ABSTRACTA: FÁBRICA DE FIGURAS 3D ===

/**
 * Interfaz de la Fábrica Abstracta.
 */
class AbstractFactory3D {
  crearCubo(lado) {
    throw new Error('Método crearCubo debe ser implementado');
  }
  // Se podrían añadir crearEsfera, crearCilindro, etc.
}

/**
 * Fábrica Concreta para crear objetos 3D.
 */
class Figuras3DFactory extends AbstractFactory3D {
  crearCubo(lado) {
    return new Cubo(lado);
  }
}

// === CLASE COLECCIÓN Y UTILIDADES ===

class ColeccionFiguras {
  constructor() {
    this.figuras = [];
  }
  agregar(figura) {
    if (figura instanceof FiguraGeometrica) {
      this.figuras.push(figura);
      return true;
    }
    return false;
  }
  listarFiguras() {
    console.log('=== COLECCIÓN DE FIGURAS ===');
    this.figuras.forEach((figura, index) => {
      console.log(`${index + 1}. ${figura.describir()}`);
    });
  }
  calcularAreaTotal() {
    return this.figuras.reduce((total, figura) => total + figura.calcularArea(), 0);
  }
  calcularPerimetroTotal() {
    // Excluye figuras 3D que no tienen un perímetro tradicional
    return this.figuras.reduce((total, figura) => {
      if (!(figura instanceof Figura3D)) {
        return total + figura.calcularPerimetro();
      }
      return total;
    }, 0);
  }
  calcularVolumenTotal() {
    // Nuevo: Calcula la suma de volúmenes para figuras 3D
    return this.figuras.reduce((total, figura) => {
      if (figura instanceof Figura3D) {
        return total + figura.calcularVolumen();
      }
      return total;
    }, 0);
  }
  filtrarPorTipo(tipo) {
    return this.figuras.filter(figura => figura.nombre === tipo);
  }
  static compararAreas(figura1, figura2) {
    const area1 = figura1.calcularArea();
    const area2 = figura2.calcularArea();
    if (area1 > area2) {
      return `${figura1.nombre} es más grande que ${figura2.nombre}`;
    } else if (area1 < area2) {
      return `${figura2.nombre} es más grande que ${figura1.nombre}`;
    } else {
      return `Ambas figuras tienen la misma área`;
    }
  }
}

// === DEMOSTRACIÓN COMPLETA DEL SISTEMA ===

console.log('🚀 SISTEMA DE FIGURAS GEOMÉTRICAS CON POO Y PATRONES DE DISEÑO\n');

// 1. Crear figuras 2D (incluyendo Pentágono y Hexágono)
const circulo = new Circulo(5);
const rectangulo = new Rectangulo(10, 8);
const triangulo = new Triangulo(8, 6, 6, 10);
const pentagono = new Pentagono(4);
const hexagono = new Hexagono(3);

// 2. Crear figura 3D usando el patrón Fábrica Abstracta
const fabrica3D = new Figuras3DFactory();
const cubo = fabrica3D.crearCubo(5);

// 3. Demostrar la Validación de Parámetros (Singleton)
console.log('🔒 VALIDACIÓN DE PARÁMETROS:');
try {
  new Circulo(0); // Esto debe lanzar un error
} catch (e) {
  console.log(`  [Éxito en Validación] ${e.message}`);
}
try {
  new Rectangulo(5, -2); // Esto debe lanzar un error
} catch (e) {
  console.log(`  [Éxito en Validación] ${e.message}`);
}
console.log(`  Validador es Singleton: ${ValidadorParametros.getInstance() === validador}\n`);

// 4. Crear colección
const coleccion = new ColeccionFiguras();
coleccion.agregar(circulo);
coleccion.agregar(rectangulo);
coleccion.agregar(triangulo);
coleccion.agregar(pentagono);
coleccion.agregar(hexagono);
coleccion.agregar(cubo);

// 5. Listar todas las figuras (polimorfismo y figuras 3D)
coleccion.listarFiguras();

// 6. Calcular totales
console.log(`\n📊 Área total: ${coleccion.calcularAreaTotal().toFixed(2)}`);
console.log(`📏 Perímetro total (solo 2D): ${coleccion.calcularPerimetroTotal().toFixed(2)}`);
console.log(`📦 Volumen total (solo 3D): ${coleccion.calcularVolumenTotal().toFixed(2)}`);

// 7. Comparación de Similitud
console.log('\n⚖️  COMPARACIÓN DE SIMILITUD:');
const circuloSimilar = new Circulo(5.000000001);
console.log(`  Círculo (5) vs Círculo (5.000000001): ${FiguraGeometrica.esSimilar(circulo, circuloSimilar)}`); // Debe ser True
const rectanguloDiferente = new Rectangulo(10, 7);
console.log(`  Rectángulo (10x8) vs Rectángulo (10x7): ${FiguraGeometrica.esSimilar(rectangulo, rectanguloDiferente)}`); // Debe ser False

// 8. Dibujo ASCII
console.log('\n🖍️  DIBUJO ASCII:');
console.log(`--- Rectángulo (10x8) ---\n${rectangulo.dibujarASCII()}`);
console.log(`\n--- Triángulo (8x6) ---\n${triangulo.dibujarASCII()}`);
console.log(`\n--- Cubo (lado 5) ---\n${cubo.dibujarASCII()}`);
console.log('\n✅ Sistema extendido e implementado exitosamente!');