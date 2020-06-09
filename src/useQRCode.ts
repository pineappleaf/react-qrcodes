import * as ReactDOM from 'react-dom';
import { useRef, useEffect } from 'react';
const QRCode = require('qrcode');

interface Props {
  text: string;
  options?: Options;
}

interface Options {
  type?: string;
  quality?: number;
  level?: string;
  margin?: number;
  scale?: number;
  width?: number;
  color?: Colors;
  imageOptions?: ImageOptions;
}

interface Colors {
  dark?: string;
  light?: string;
}

interface ImageOptions {
  src: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
}

export function useQRCode({ ...props }: Props): any {
  const inputRef = useRef();
  const { text, options } = props;

  useEffect(
    function () {
      if (inputRef) {
        const ref = inputRef as any;
        if (ref.current.tagName === 'CANVAS') {
          const canvas: HTMLCanvasElement = ReactDOM.findDOMNode(
            ref.current,
          ) as HTMLCanvasElement;
          if (options) {
            const imageOptions = options.imageOptions;
            if (imageOptions && imageOptions.src) {
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.src = imageOptions.src;
              img.onload = function () {
                if (imageOptions) {
                  if (imageOptions.width) {
                    img.width = imageOptions.width;
                  }
                  if (imageOptions.height) {
                    img.height = imageOptions.height;
                  }
                }

                const wrh = img.width / img.height;
                let dWidth = canvas.width;
                let dHeight = dWidth / wrh;
                if (dHeight > canvas.height) {
                  dHeight = canvas.height;
                  dWidth = dHeight * wrh;
                }

                dWidth = imageOptions.width ? imageOptions.width : dWidth;
                dHeight = imageOptions.height ? imageOptions.height : dHeight;

                const dx = imageOptions.x
                  ? imageOptions.x
                  : dWidth < canvas.width
                  ? (canvas.width - dWidth) / 2
                  : 0;
                const dy = imageOptions.y
                  ? imageOptions.y
                  : dHeight < canvas.height
                  ? (canvas.height - dHeight) / 2
                  : 0;

                if (ctx) {
                  ctx.globalAlpha = imageOptions.opacity || 1;
                  ctx.drawImage(img, dx, dy, dWidth, dHeight);
                }
              };
            }
          }
          QRCode.toCanvas(canvas, text, options, function (error: any) {
            if (error) {
              throw error;
            }
          });
        } else {
          QRCode.toDataURL(text, options, function (error: any, url: any) {
            if (error) {
              throw error;
            }
            ref.current.src = url;
          });
        }
      }
    },
    [text, options],
  );

  return { inputRef };
}
