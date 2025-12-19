export const scrollToSection = (sectionId) => {
  if (!sectionId) return false;
  
  const element = document.getElementById(sectionId);
  if (!element) {
    console.warn(`Section ${sectionId} not found`);
    return false;
  }
  
  const headerHeight = 80;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerHeight;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
  
  element.focus({ preventScroll: true });
  
  if (element.classList && !element.classList.contains('highlight-section')) {
    element.classList.add('highlight-section');
    setTimeout(() => {
      element.classList.remove('highlight-section');
    }, 3000);
  }
  
  return true;
};

export const navigateToRoute = (route) => {
  if (!route) return false;
  
  try {
    window.location.hash = route;
    return true;
  } catch (error) {
    console.error('Navigation error:', error);
    return false;
  }
};

export const executeNavigation = (navigationData) => {
  const { section, route, label } = navigationData;
  
  if (section) {
    return scrollToSection(section);
  } else if (route) {
    return navigateToRoute(route);
  }
  
  return false;
};

export const highlightSectionStyle = `
  <style>
    @keyframes highlight-pulse {
      0% {
        background-color: rgba(79, 70, 229, 0);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
      }
      100% {
        background-color: rgba(79, 70, 229, 0);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
      }
    }
    
    .highlight-section {
      animation: highlight-pulse 1s ease-out;
    }
  </style>
`;

if (!document.querySelector('style[data-highlight-section]')) {
  const style = document.createElement('style');
  style.setAttribute('data-highlight-section', 'true');
  style.textContent = `
    @keyframes highlight-pulse {
      0% {
        background-color: rgba(79, 70, 229, 0.1);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
      }
      100% {
        background-color: rgba(79, 70, 229, 0);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
      }
    }
    
    .highlight-section {
      animation: highlight-pulse 1s ease-out !important;
    }
  `;
  document.head.appendChild(style);
}
