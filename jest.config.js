module.exports = {
    testEnvironment: 'jsdom', // Define o ambiente de teste como DOM
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest' // Transforma arquivos JS/JSX usando Babel
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$':
            'identity-obj-proxy' // Ignora arquivos de estilo
    }
};
