/**
 * Effects Library - Predefined effects and transitions
 */

export const EFFECTS = {
  color: {
    brightness: {
      name: 'Яркость',
      params: {
        brightness: { type: 'number', min: -100, max: 100, default: 0 },
      },
    },
    contrast: {
      name: 'Контраст',
      params: {
        contrast: { type: 'number', min: -100, max: 100, default: 0 },
      },
    },
    saturation: {
      name: 'Насыщенность',
      params: {
        saturation: { type: 'number', min: -100, max: 100, default: 0 },
      },
    },
    hue: {
      name: 'Оттенок',
      params: {
        hue: { type: 'number', min: -180, max: 180, default: 0 },
      },
    },
    temperature: {
      name: 'Температура',
      params: {
        temperature: { type: 'number', min: -100, max: 100, default: 0 },
      },
    },
  },
  transform: {
    scale: {
      name: 'Масштаб',
      params: {
        scaleX: { type: 'number', min: 0, max: 500, default: 100 },
        scaleY: { type: 'number', min: 0, max: 500, default: 100 },
      },
    },
    position: {
      name: 'Позиция',
      params: {
        x: { type: 'number', min: -1000, max: 1000, default: 0 },
        y: { type: 'number', min: -1000, max: 1000, default: 0 },
      },
    },
    rotation: {
      name: 'Вращение',
      params: {
        angle: { type: 'number', min: -360, max: 360, default: 0 },
      },
    },
  },
  style: {
    blur: {
      name: 'Размытие',
      params: {
        amount: { type: 'number', min: 0, max: 100, default: 0 },
      },
    },
    sharpen: {
      name: 'Резкость',
      params: {
        amount: { type: 'number', min: 0, max: 100, default: 0 },
      },
    },
  },
} as const;

export const TRANSITIONS = {
  dissolve: {
    name: 'Растворение',
    params: {
      duration: { type: 'number', min: 0, max: 5000, default: 500 },
    },
  },
  fade: {
    name: 'Затухание',
    params: {
      duration: { type: 'number', min: 0, max: 5000, default: 500 },
      color: { type: 'color', default: '#000000' },
    },
  },
  wipe: {
    name: 'Вытеснение',
    params: {
      direction: {
        type: 'select',
        options: ['left', 'right', 'up', 'down'],
        default: 'right',
      },
      duration: { type: 'number', min: 0, max: 5000, default: 500 },
      softness: { type: 'number', min: 0, max: 100, default: 50 },
    },
  },
  slide: {
    name: 'Сдвиг',
    params: {
      direction: {
        type: 'select',
        options: ['left', 'right', 'up', 'down'],
        default: 'right',
      },
      duration: { type: 'number', min: 0, max: 5000, default: 500 },
    },
  },
} as const;

export const ANIMATION_PRESETS = {
  ken_burns: {
    name: 'Ken Burns',
    description: 'Плавный zoom + pan',
    keyframes: {
      scale: [
        { time: 0, value: 100 },
        { time: 100, value: 120 },
      ],
      position: [
        { time: 0, value: { x: 0, y: 0 } },
        { time: 100, value: { x: -50, y: -50 } },
      ],
    },
  },
  zoom_in: {
    name: 'Zoom In',
    description: 'Приближение',
    keyframes: {
      scale: [
        { time: 0, value: 100 },
        { time: 100, value: 120 },
      ],
    },
  },
  zoom_out: {
    name: 'Zoom Out',
    description: 'Отдаление',
    keyframes: {
      scale: [
        { time: 0, value: 120 },
        { time: 100, value: 100 },
      ],
    },
  },
  fade_in: {
    name: 'Fade In',
    description: 'Появление',
    keyframes: {
      opacity: [
        { time: 0, value: 0 },
        { time: 100, value: 100 },
      ],
    },
  },
  fade_out: {
    name: 'Fade Out',
    description: 'Исчезновение',
    keyframes: {
      opacity: [
        { time: 0, value: 100 },
        { time: 100, value: 0 },
      ],
    },
  },
} as const;
