// Aplicação Code Snippet Viewer
class CodeSnippetViewer {
    constructor() {
        // Detecta tema salvo ou do sistema
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        // Tenta restaurar abas do localStorage
        const savedTabs = localStorage.getItem('tabs');
        const savedActiveTab = localStorage.getItem('activeTab');
        if (savedTabs) {
            this.tabs = JSON.parse(savedTabs);
            this.activeTab = savedActiveTab ? parseInt(savedActiveTab) : 0;
        } else {
            this.tabs = [{ code: '', language: 'javascript', name: 'Snippet 1' }];
            this.activeTab = 0;
        }
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.updateUI();
    }

    initializeElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            languageSelect: document.getElementById('languageSelect'),
            codeInput: document.getElementById('codeInput'),
            codeOutput: document.getElementById('codeOutput'),
            loadFileBtn: document.getElementById('loadFileBtn'),
            fileInput: document.getElementById('fileInput'),
            copyBtn: document.getElementById('copyBtn'),
            exportBtn: document.getElementById('exportBtn'),
            exportImageBtn: document.getElementById('exportImageBtn'),
            exportPdfBtn: document.getElementById('exportPdfBtn'),
            newTabBtn: document.getElementById('newTabBtn'),
            dropZone: document.getElementById('dropZone'),
            editorTabs: document.getElementById('editorTabs'),
            tabNameInput: document.getElementById('tabNameInput')
        };
    }

    bindEvents() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Language selection
        this.elements.languageSelect.addEventListener('change', (e) => {
            this.tabs[this.activeTab].language = e.target.value;
            this.highlightCode();
        });
        
        // Code input
        this.elements.codeInput.addEventListener('input', (e) => {
            this.tabs[this.activeTab].code = e.target.value;
            // Detecta linguagem automaticamente ao colar ou digitar
            if (e.inputType === 'insertFromPaste' || e.inputType === undefined) {
                const detected = this.detectLanguageFromContent(e.target.value);
                this.tabs[this.activeTab].language = detected;
                this.elements.languageSelect.value = detected;
            }
            this.highlightCode();
        });
        
        // Editar nome da aba/snippet
        this.elements.tabNameInput.addEventListener('input', (e) => {
            this.tabs[this.activeTab].name = e.target.value || `Snippet ${this.activeTab + 1}`;
            this.updateTabsUI();
            this.saveTabsToStorage();
        });
        
        // File operations
        this.elements.loadFileBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        // Copy functionality
        this.elements.copyBtn.addEventListener('click', () => this.copyCode());
        
        // Export functionality
        this.elements.exportBtn.addEventListener('click', () => this.exportCode());
        
        // Export PDF functionality
        this.elements.exportPdfBtn.addEventListener('click', () => this.exportAsPdf());
        
        // New tab
        this.elements.newTabBtn.addEventListener('click', () => this.createNewTab());
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Tab events
        this.elements.editorTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                const tabIndex = parseInt(e.target.dataset.close);
                this.closeTab(tabIndex);
            } else if (e.target.classList.contains('tab')) {
                const tabIndex = parseInt(e.target.dataset.tab);
                this.switchTab(tabIndex);
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        this.elements.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        // Alterna Prism.js
        const lightTheme = document.getElementById('prism-light-theme');
        const darkTheme = document.getElementById('prism-dark-theme');
        if (this.currentTheme === 'dark') {
            lightTheme.disabled = true;
            darkTheme.disabled = false;
        } else {
            lightTheme.disabled = false;
            darkTheme.disabled = true;
        }
        this.highlightCode();
    }

    createNewTab() {
        const tabNumber = this.tabs.length + 1;
        this.tabs.push({
            code: '',
            language: 'javascript',
            name: `Snippet ${tabNumber}`
        });
        
        this.activeTab = this.tabs.length - 1;
        this.updateUI();
        this.showNotification('Nova aba criada!', 'success');
    }

    closeTab(index) {
        if (this.tabs.length === 1) {
            this.showNotification('Não é possível fechar a última aba!', 'error');
            return;
        }
        
        this.tabs.splice(index, 1);
        
        if (this.activeTab >= this.tabs.length) {
            this.activeTab = this.tabs.length - 1;
        } else if (this.activeTab > index) {
            this.activeTab--;
        }
        
        this.updateUI();
    }

    switchTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.activeTab = index;
            this.updateUI();
        }
    }

    updateUI() {
        // Atualiza tabs
        this.updateTabsUI();
        // Atualiza nome do snippet/aba
        this.elements.tabNameInput.value = this.tabs[this.activeTab].name;
        // Atualiza código e linguagem
        this.elements.codeInput.value = this.tabs[this.activeTab].code;
        this.elements.languageSelect.value = this.tabs[this.activeTab].language;
        this.highlightCode();
    }

    saveTabsToStorage() {
        localStorage.setItem('tabs', JSON.stringify(this.tabs));
        localStorage.setItem('activeTab', this.activeTab);
    }

    highlightCode() {
        const currentTab = this.tabs[this.activeTab];
        const code = currentTab.code || '// Seu código aparecerá aqui com destaque de sintaxe';
        const language = currentTab.language;
        
        // Cria o elemento code
        const codeElement = document.createElement('code');
        codeElement.className = `language-${language}`;
        codeElement.textContent = code;
        
        const preElement = document.createElement('pre');
        preElement.appendChild(codeElement);
        
        // Limpa e adiciona o novo código destacado
        this.elements.codeOutput.innerHTML = '';
        this.elements.codeOutput.appendChild(preElement);
        
        // Aplica o Prism
        Prism.highlightElement(codeElement);
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            // Detecta linguagem pelo conteúdo e extensão
            let language = this.detectLanguageFromFilename(file.name);
            const detected = this.detectLanguageFromContent(content);
            if (detected && detected !== 'javascript') language = detected;
            this.tabs[this.activeTab].code = content;
            this.tabs[this.activeTab].language = language;
            this.tabs[this.activeTab].name = file.name;
            this.updateUI();
            this.showNotification(`Arquivo ${file.name} carregado com sucesso!`, 'success');
        };
        reader.readAsText(file);
    }

    detectLanguageFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const langMap = {
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'sql': 'sql',
            'php': 'php',
            'cpp': 'cpp',
            'cs': 'csharp',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'ts': 'typescript'
        };
        
        return langMap[ext] || 'javascript';
    }

    detectLanguageFromContent(content) {
        // Heurística simples baseada em palavras-chave
        const tests = [
            { lang: 'python', regex: /def |import |print\(|self|elif|except|None|True|False|# / },
            { lang: 'javascript', regex: /function |const |let |var |=>|console\.log|document\.|window\.|\/\// },
            { lang: 'java', regex: /public |private |class |System\.out|void |static |new |import java/ },
            { lang: 'html', regex: /<html|<div|<span|<head|<body|<!DOCTYPE html>/i },
            { lang: 'css', regex: /\.[a-zA-Z0-9_-]+ ?\{|#[a-zA-Z0-9_-]+ ?\{|:root|--[a-zA-Z0-9-]+:/ },
            { lang: 'json', regex: /\{\s*"[^"]+"\s*:/ },
            { lang: 'xml', regex: /<\?xml|<([a-zA-Z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)|<([a-zA-Z]+)\s/ },
            { lang: 'sql', regex: /SELECT |INSERT |UPDATE |DELETE |FROM |WHERE |JOIN |CREATE TABLE/i },
            { lang: 'php', regex: /<\?php|echo |\$[a-zA-Z_]/ },
            { lang: 'cpp', regex: /#include |std::|cout|cin|int main\(/ },
            { lang: 'csharp', regex: /using System|namespace |public class |Console\.WriteLine/ },
            { lang: 'ruby', regex: /def |end|puts |class |module |require |:symbol/ },
            { lang: 'go', regex: /package main|func main\(|fmt\.|import \(|go / },
            { lang: 'rust', regex: /fn main\(|let mut |println!|use std::/ },
            { lang: 'typescript', regex: /: string|: number|interface |type |export |import |from '|from "/ }
        ];
        for (const test of tests) {
            if (test.regex.test(content)) return test.lang;
        }
        return 'javascript'; // fallback
    }

    setupDragAndDrop() {
        const dropZone = this.elements.dropZone;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });
        
        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFileLoad({ target: { files: [files[0]] } });
            }
        });
    }

    copyCode() {
        const currentTab = this.tabs[this.activeTab];
        if (!currentTab.code) {
            this.showNotification('Nenhum código para copiar!', 'error');
            return;
        }
        
        navigator.clipboard.writeText(currentTab.code).then(() => {
            this.showNotification('Código copiado para a área de transferência!', 'success');
        }).catch(() => {
            this.showNotification('Erro ao copiar código!', 'error');
        });
    }

    exportCode() {
        const currentTab = this.tabs[this.activeTab];
        if (!currentTab.code) {
            this.showNotification('Nenhum código para exportar!', 'error');
            return;
        }
        // Exportação como texto (original)
        const blob = new Blob([currentTab.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTab.name || 'snippet'}.${this.getFileExtension(currentTab.language)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Código exportado como arquivo!', 'success');
        // Exportação como imagem
        this.exportAsImage();
    }

    exportAsImage() {
        if (typeof html2canvas !== 'function') {
            this.showNotification('Exportação como imagem requer html2canvas!', 'error');
            return;
        }
        const codeOutput = this.elements.codeOutput;
        const pre = codeOutput.querySelector('pre');
        // Salva estilos originais
        const originalHeight = codeOutput.style.height;
        const originalMaxHeight = codeOutput.style.maxHeight;
        const originalWidth = codeOutput.style.width;
        const originalPreHeight = pre ? pre.style.height : '';
        const originalPreMaxHeight = pre ? pre.style.maxHeight : '';
        const originalPreWidth = pre ? pre.style.width : '';
        // Ajusta para caber todo o conteúdo
        if (pre) {
            pre.style.height = pre.scrollHeight + 'px';
            pre.style.maxHeight = 'none';
            pre.style.width = pre.scrollWidth + 'px';
        }
        codeOutput.style.height = (pre ? pre.scrollHeight : codeOutput.scrollHeight) + 'px';
        codeOutput.style.maxHeight = 'none';
        codeOutput.style.width = (pre ? pre.scrollWidth : codeOutput.scrollWidth) + 'px';
        // Aguarda renderização
        setTimeout(() => {
            html2canvas(codeOutput, {
                backgroundColor: null,
                useCORS: true,
                width: pre ? pre.scrollWidth : codeOutput.scrollWidth,
                height: pre ? pre.scrollHeight : codeOutput.scrollHeight,
                windowWidth: pre ? pre.scrollWidth : codeOutput.scrollWidth,
                windowHeight: pre ? pre.scrollHeight : codeOutput.scrollHeight
            }).then(canvas => {
                // Restaura estilos
                codeOutput.style.height = originalHeight;
                codeOutput.style.maxHeight = originalMaxHeight;
                codeOutput.style.width = originalWidth;
                if (pre) {
                    pre.style.height = originalPreHeight;
                    pre.style.maxHeight = originalPreMaxHeight;
                    pre.style.width = originalPreWidth;
                }
                const link = document.createElement('a');
                link.download = `${currentTab.name || 'snippet'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                this.showNotification('Código exportado como imagem!', 'success');
            }).catch(() => {
                codeOutput.style.height = originalHeight;
                codeOutput.style.maxHeight = originalMaxHeight;
                codeOutput.style.width = originalWidth;
                if (pre) {
                    pre.style.height = originalPreHeight;
                    pre.style.maxHeight = originalPreMaxHeight;
                    pre.style.width = originalPreWidth;
                }
                this.showNotification('Erro ao exportar imagem!', 'error');
            });
        }, 100);
    }

    exportAsPdf() {
        const currentTab = this.tabs[this.activeTab];
        if (!currentTab.code) {
            this.showNotification('Nenhum código para exportar!', 'error');
            return;
        }
        if (typeof html2canvas !== 'function' || typeof window.jspdf === 'undefined') {
            this.showNotification('Exportação PDF requer html2canvas e jsPDF!', 'error');
            return;
        }
        const codeOutput = this.elements.codeOutput;
        const pre = codeOutput.querySelector('pre');
        // Salva estilos originais
        const originalHeight = codeOutput.style.height;
        const originalMaxHeight = codeOutput.style.maxHeight;
        const originalWidth = codeOutput.style.width;
        const originalPreHeight = pre ? pre.style.height : '';
        const originalPreMaxHeight = pre ? pre.style.maxHeight : '';
        const originalPreWidth = pre ? pre.style.width : '';
        // Ajusta para caber todo o conteúdo
        if (pre) {
            pre.style.height = pre.scrollHeight + 'px';
            pre.style.maxHeight = 'none';
            pre.style.width = pre.scrollWidth + 'px';
        }
        codeOutput.style.height = (pre ? pre.scrollHeight : codeOutput.scrollHeight) + 'px';
        codeOutput.style.maxHeight = 'none';
        codeOutput.style.width = (pre ? pre.scrollWidth : codeOutput.scrollWidth) + 'px';
        setTimeout(() => {
            html2canvas(codeOutput, {
                backgroundColor: null,
                useCORS: true,
                width: pre ? pre.scrollWidth : codeOutput.scrollWidth,
                height: pre ? pre.scrollHeight : codeOutput.scrollHeight,
                windowWidth: pre ? pre.scrollWidth : codeOutput.scrollWidth,
                windowHeight: pre ? pre.scrollHeight : codeOutput.scrollHeight
            }).then(canvas => {
                // Restaura estilos
                codeOutput.style.height = originalHeight;
                codeOutput.style.maxHeight = originalMaxHeight;
                codeOutput.style.width = originalWidth;
                if (pre) {
                    pre.style.height = originalPreHeight;
                    pre.style.maxHeight = originalPreMaxHeight;
                    pre.style.width = originalPreWidth;
                }
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
                // Calcula escala para caber na página
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                let imgWidth = canvas.width;
                let imgHeight = canvas.height;
                const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight, 1);
                imgWidth *= scale;
                imgHeight *= scale;
                const x = (pageWidth - imgWidth) / 2;
                const y = 40; // margem superior
                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                pdf.save(`${currentTab.name || 'snippet'}.pdf`);
                this.showNotification('Código exportado como PDF!', 'success');
            }).catch(() => {
                codeOutput.style.height = originalHeight;
                codeOutput.style.maxHeight = originalMaxHeight;
                codeOutput.style.width = originalWidth;
                if (pre) {
                    pre.style.height = originalPreHeight;
                    pre.style.maxHeight = originalPreMaxHeight;
                    pre.style.width = originalPreWidth;
                }
                this.showNotification('Erro ao exportar PDF!', 'error');
            });
        }, 100);
    }

    getFileExtension(language) {
        const extMap = {
            'javascript': 'js',
            'python': 'py',
            'java': 'java',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'sql': 'sql',
            'php': 'php',
            'cpp': 'cpp',
            'csharp': 'cs',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
            'typescript': 'ts'
        };
        
        return extMap[language] || 'txt';
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'd':
                case 'D':
                    event.preventDefault();
                    this.toggleTheme();
                    break;
                case 'c':
                case 'C':
                    if (event.target !== this.elements.codeInput) {
                        event.preventDefault();
                        this.copyCode();
                    }
                    break;
                case 'n':
                case 'N':
                    event.preventDefault();
                    this.createNewTab();
                    break;
                case 's':
                case 'S':
                    event.preventDefault();
                    this.exportCode();
                    break;
            }
        }
    }

    showNotification(message, type = 'success') {
        // Remove notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✔️' : '❌'}</span>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Animação de fade-in
        setTimeout(() => notification.classList.add('show'), 100);
        // Fade-out após 3s
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateTabsUI() {
        // Atualiza visual das abas (mantém nomes atualizados)
        this.elements.editorTabs.innerHTML = this.tabs.map((tab, i) => `
            <div class="tab${i === this.activeTab ? ' active' : ''}" data-tab="${i}">
                ${tab.name}
                <span class="tab-close" data-close="${i}">×</span>
            </div>
        `).join('');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeSnippetViewer();
});

// Add some sample code on first load
window.addEventListener('load', () => {
    const sampleCode = `// Exemplo de função JavaScript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Teste da função
console.log('Fibonacci de 10:', fibonacci(10));

// Exemplo com arrow function
const multiply = (a, b) => a * b;

// Exemplo com async/await
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}`;

    const codeInput = document.getElementById('codeInput');
    if (codeInput && !codeInput.value) {
        codeInput.value = sampleCode;
        codeInput.dispatchEvent(new Event('input'));
    }
});