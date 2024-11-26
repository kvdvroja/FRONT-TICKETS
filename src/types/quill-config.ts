import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';

// Verificar y registrar los módulos una sola vez
if (!Quill.imports['modules/imageDrop']) {
  Quill.register('modules/imageDrop', ImageDrop);
}

if (!Quill.imports['modules/imageResize']) {
  Quill.register('modules/imageResize', ImageResize);
}

console.log('Quill modules registered: imageResize, imageDrop');
