import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto py-4">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          Desenvolvido por{' '}
          <a
            href="https://duoweb.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            DuoWeb
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
