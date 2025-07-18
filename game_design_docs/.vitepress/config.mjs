import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '苏丹的游戏 - 设计文档',
  description: '《苏丹的游戏》官方设计文档',
  
  head: [
    ['script', { src: 'https://unpkg.com/mermaid@9.4.3/dist/mermaid.min.js' }],
    ['script', {}, `
      if (typeof window !== 'undefined') {
        window.addEventListener('load', function() {
          if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ 
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true
              }
            });
            
            // 渲染函数：支持去重，避免重复渲染
            function renderMermaid() {
              const mermaidElements = [];

              // 1) 传统 mermaid fenced code
              document.querySelectorAll('div.language-mermaid pre').forEach(pre => {
                const code = pre.querySelector('code');
                if (code && !code.dataset.mermaidRendered) mermaidElements.push(code);
              });

              // 2) 兼容结构
              document.querySelectorAll('pre code.language-mermaid').forEach(code => {
                if (!code.dataset.mermaidRendered) mermaidElements.push(code);
              });
              
              // 3) 直接 .mermaid 元素
              document.querySelectorAll('.mermaid').forEach(el => {
                if (!el.dataset.mermaidRendered) mermaidElements.push(el);
              });

              mermaidElements.forEach((element) => {
                if (element.textContent && element.textContent.trim()) {
                  const graphDefinition = element.textContent.trim();
                  const graphId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).slice(2);
                  
                  // 创建新的容器
                  const mermaidDiv = document.createElement('div');
                  mermaidDiv.id = graphId;
                  mermaidDiv.className = 'mermaid-container';
                  
                  const container = element.closest('div.language-mermaid') || element.closest('pre') || element;
                  if (container) {
                    container.parentNode.replaceChild(mermaidDiv, container);
                    try {
                      mermaid.render(graphId + '-svg', graphDefinition, (svgCode) => {
                        mermaidDiv.innerHTML = svgCode;
                      });
                    } catch (error) {
                      console.error('Mermaid渲染错误:', error);
                      mermaidDiv.innerHTML = '<p>流程图渲染失败</p>';
                    }
                  }
                  // 标记为已渲染
                  element.dataset.mermaidRendered = 'true';
                }
              });
            }
            
            // 初始 & 延迟渲染
            setTimeout(renderMermaid, 300);
            
            // 监听 DOM 变化（VitePress SPA 路由切换时会替换 #app 内部节点）
            const appRoot = document.querySelector('#app');
            if (appRoot && typeof MutationObserver !== 'undefined') {
              const observer = new MutationObserver(() => renderMermaid());
              observer.observe(appRoot, { childList: true, subtree: true });
            }
            
            // 兼容传统完整页面跳转
            window.addEventListener('pageshow', () => setTimeout(renderMermaid, 200));
          }
        });
      }
    `]
  ],
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '设计文档', link: '/DESIGN_SUMMARY' }
    ],
    sidebar: [
      {
        text: '游戏设计文档',
        items: [
          { text: '设计总览', link: '/DESIGN_SUMMARY' },
          { text: '对话流程重设计', link: '/DIALOGUE_FLOW_REDESIGN' },
          { text: 'AI智能体系统', link: '/AI_AGENT_SYSTEM' },
          { text: '场景流程设计', link: '/SCENE_FLOW_DESIGN' },
          { text: '后端配置设计', link: '/BACKEND_CONFIG_DESIGN' },
          { text: '卡片系统设计', link: '/CARD_SYSTEM_DESIGN' },
        ]
      }
    ]
  }
}) 