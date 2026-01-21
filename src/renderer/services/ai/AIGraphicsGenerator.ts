/**
 * AI Graphics Generator - Generate complex graphics compositions
 */

import { aiMultiProviderService } from './AIMultiProviderService';

export interface GraphicElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'video';
  content?: string;
  position: { x: number; y: number; width: number; height: number };
  style: {
    backgroundColor?: string;
    borderRadius?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    boxShadow?: string;
    border?: string;
  };
  animation?: {
    type: string;
    duration: number;
    easing: string;
    delay?: number;
  };
  zIndex: number;
}

export interface GraphicsComposition {
  elements: GraphicElement[];
  duration: number;
  width: number;
  height: number;
}

class AIGraphicsGenerator {
  private static instance: AIGraphicsGenerator;

  private constructor() {}

  static getInstance(): AIGraphicsGenerator {
    if (!AIGraphicsGenerator.instance) {
      AIGraphicsGenerator.instance = new AIGraphicsGenerator();
    }
    return AIGraphicsGenerator.instance;
  }

  /**
   * Generate complex composition from description
   * Example: "фото с вращением + прямоугольное окно с закругленными углами + текст Layzer в Minecraft стиле + 7% скидка"
   */
  async generateComposition(description: string, context: any = {}): Promise<GraphicsComposition> {
    console.log(`🎨 Generating composition: "${description}"`);

    // Use multi-AI collaboration
    const composition = await aiMultiProviderService.generateComplexComposition(
      description,
      context
    );

    // Convert AI response to GraphicElement[]
    const elements = this.convertToElements(composition);

    return {
      elements,
      duration: 5000, // Default 5 seconds
      width: 1920,
      height: 1080,
    };
  }

  /**
   * Generate text with specific style
   */
  async generateStyledText(
    text: string,
    style: string,
    position?: string
  ): Promise<GraphicElement> {
    console.log(`📝 Generating text "${text}" in ${style} style`);

    // Special styles
    const styleConfigs: Record<string, any> = {
      minecraft: {
        fontFamily: 'Minecraft, monospace',
        fontSize: 72,
        color: '#55FF55',
        textShadow: '4px 4px 0px #003300',
        letterSpacing: '2px',
      },
      neon: {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 64,
        color: '#FF00FF',
        textShadow: '0 0 20px #FF00FF, 0 0 40px #FF00FF',
      },
      elegant: {
        fontFamily: 'Georgia, serif',
        fontSize: 48,
        color: '#333333',
        fontWeight: '300',
      },
      bold: {
        fontFamily: 'Impact, sans-serif',
        fontSize: 80,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
        fontWeight: 'bold',
      },
    };

    const selectedStyle = styleConfigs[style.toLowerCase()] || styleConfigs.bold;

    // Calculate position
    const pos = this.parsePosition(position || 'center');

    return {
      id: `text-${Date.now()}`,
      type: 'text',
      content: text,
      position: pos,
      style: selectedStyle,
      zIndex: 10,
    };
  }

  /**
   * Generate rounded rectangle (for overlays, backgrounds)
   */
  generateRoundedRect(
    width: number,
    height: number,
    borderRadius: number,
    color: string,
    position?: string
  ): GraphicElement {
    const pos = this.parsePosition(position || 'center');

    return {
      id: `rect-${Date.now()}`,
      type: 'shape',
      position: { ...pos, width, height },
      style: {
        backgroundColor: color,
        borderRadius,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      },
      zIndex: 5,
    };
  }

  /**
   * Parse example request like:
   * "первое фото с вращением + прямоугольник 400x200 с закругленными углами + текст Layzer в Minecraft стиле + текст '7% скидка'"
   */
  async parseComplexRequest(request: string): Promise<GraphicsComposition> {
    console.log(`🔍 Parsing complex request: "${request}"`);

    const elements: GraphicElement[] = [];
    let yOffset = 100;

    // Extract elements from request
    const parts = request.split('+').map((p) => p.trim());

    for (const part of parts) {
      // Check for photo with rotation
      if (/фото|картинк/i.test(part) && /вращ/i.test(part)) {
        elements.push({
          id: `photo-${Date.now()}`,
          type: 'image',
          position: { x: 50, y: yOffset, width: 600, height: 400 },
          style: {},
          animation: {
            type: 'rotate3D',
            duration: 3000,
            easing: 'ease-in-out',
          },
          zIndex: 1,
        });
        yOffset += 450;
      }

      // Check for rounded rectangle
      if (/прямоугольн/i.test(part) && /закругл/i.test(part)) {
        // Extract dimensions if provided
        const sizeMatch = part.match(/(\d+)\s*[x×]\s*(\d+)/);
        const width = sizeMatch ? parseInt(sizeMatch[1]) : 400;
        const height = sizeMatch ? parseInt(sizeMatch[2]) : 200;

        elements.push(
          this.generateRoundedRect(width, height, 20, '#2a2a2a', `x:50,y:${yOffset}`)
        );
        yOffset += height + 50;
      }

      // Check for text in Minecraft style
      if (/minecraft/i.test(part) || /майнкрафт/i.test(part)) {
        const textMatch = part.match(/текст\s+['"]?(\w+)['"]?/i);
        const text = textMatch ? textMatch[1] : 'Layzer';

        const textElement = await this.generateStyledText(
          text,
          'minecraft',
          `x:100,y:${yOffset}`
        );
        elements.push(textElement);
        yOffset += 100;
      }

      // Check for discount text
      if (/скидк/i.test(part) || /%/.test(part)) {
        const discountMatch = part.match(/(\d+%)/);
        const discountText = discountMatch ? discountMatch[0] + ' скидка' : '7% скидка';

        const discountElement = await this.generateStyledText(
          discountText,
          'neon',
          `x:500,y:${yOffset - 80}`
        );
        elements.push(discountElement);
      }
    }

    return {
      elements,
      duration: 5000,
      width: 1920,
      height: 1080,
    };
  }

  /**
   * Convert AI composition to GraphicElement[]
   */
  private convertToElements(aiComposition: any): GraphicElement[] {
    if (!aiComposition.animation || !aiComposition.animation.elements) {
      return [];
    }

    return aiComposition.animation.elements.map((el: any, index: number) => ({
      id: el.id || `element-${index}`,
      type: el.type || 'shape',
      content: el.content || el.text,
      position: el.position || { x: 0, y: 0, width: 100, height: 100 },
      style: el.style || {},
      animation: el.animation,
      zIndex: el.zIndex || index,
    }));
  }

  /**
   * Parse position string like "center", "x:100,y:200", "bottom-right"
   */
  private parsePosition(position: string): { x: number; y: number; width: number; height: number } {
    const presets: Record<string, any> = {
      center: { x: 660, y: 440, width: 600, height: 200 },
      'top-left': { x: 50, y: 50, width: 400, height: 150 },
      'top-right': { x: 1470, y: 50, width: 400, height: 150 },
      'bottom-left': { x: 50, y: 880, width: 400, height: 150 },
      'bottom-right': { x: 1470, y: 880, width: 400, height: 150 },
    };

    if (presets[position]) {
      return presets[position];
    }

    // Parse "x:100,y:200"
    const match = position.match(/x:(\d+),y:(\d+)/);
    if (match) {
      return {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        width: 400,
        height: 100,
      };
    }

    return presets.center;
  }

  /**
   * Generate AI video from image (text-to-video)
   */
  async generateVideoFromImage(
    imagePath: string,
    prompt: string,
    duration: number = 3000
  ): Promise<{ videoUrl: string; effects: any[] }> {
    console.log(`🎥 Generating AI video from image with prompt: "${prompt}"`);

    // TODO: Integration with video generation API (Runway, Pika, Stable Video)
    // For now, return animated version with effects

    const effects = [
      {
        type: 'ken-burns',
        params: { startScale: 1, endScale: 1.2, duration },
      },
      {
        type: 'motion-blur',
        params: { intensity: 0.3 },
      },
    ];

    // In real implementation, would call:
    // - Runway Gen-2 API
    // - Pika Labs API
    // - Stable Video Diffusion
    // - Genmo API

    return {
      videoUrl: imagePath, // Placeholder - would be generated video URL
      effects,
    };
  }
}

export const aiGraphicsGenerator = AIGraphicsGenerator.getInstance();
