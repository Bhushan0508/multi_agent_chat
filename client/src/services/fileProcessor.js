export const fileProcessor = {
  async process(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
          resolve({
            type: 'image',
            name: file.name,
            content: e.target.result, // base64
            displayText: `[Image: ${file.name}]`
          });
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDF, we can't easily extract text without a library in pure client-side
        // but we can mock it or just say "PDF Uploaded"
        resolve({
          type: 'document',
          name: file.name,
          displayText: `[PDF Document: ${file.name}] (Text extraction requires local library)`
        });
      } else {
        // Text based files
        reader.onload = (e) => {
          resolve({
            type: 'text',
            name: file.name,
            content: e.target.result,
            displayText: `[File Content: ${file.name}]\n\n${e.target.result.slice(0, 1000)}...`
          });
        };
        reader.readAsText(file);
      }
    });
  }
};
