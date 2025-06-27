'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Beacon?: {
      (method: string, ...args: any[]): void;
      init: (id: string, options?: any) => void;
      open: () => void;
      toggle: () => void;
      close: () => void;
      readyQueue: Array<{ method: string; options?: any; data?: any }>;
      identify: (email: string, userData?: any) => void;
      navigate: (section: string) => void;
    };
  }
}

export function HelpScoutBeacon() {
  useEffect(() => {
    // Initialize HelpScout Beacon
    if (typeof window !== 'undefined') {
      // Load the HelpScout script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        !function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});
      `;
      document.head.appendChild(script);

      // Initialize the beacon for live chat
      const initScript = document.createElement('script');
      initScript.type = 'text/javascript';
      initScript.innerHTML = `
        window.Beacon('init', '55a13cab-7473-42a4-a241-3aa4c8461335', {
          enableFabAnimation: true,
          poweredBy: false,
          chat: {
            enabled: true,
            connectOnPageLoad: false
          }
        });
      `;
      document.head.appendChild(initScript);
    }
  }, []);

  return null;
}

export function openHelpScout() {
  if (typeof window !== 'undefined' && window.Beacon) {
    window.Beacon('open');
  }
}

export function openLiveChat() {
  if (typeof window !== 'undefined' && window.Beacon) {
    window.Beacon('navigate', 'chat');
  }
}

export function identifyUser(email: string, userData?: any) {
  if (typeof window !== 'undefined' && window.Beacon) {
    window.Beacon('identify', email, userData);
  }
}
