document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('productForm');
    const tableBody = document.querySelector('#productTable tbody');
    const generateFileButton = document.getElementById('generateFile');
    const clearTableButton = document.getElementById('clearTable');
    const removeLastButton = document.getElementById('removeLast');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmClearButton = document.getElementById('confirmClearTable');
    const cancelClearButton = document.getElementById('cancelClearTable');

    // Recupera produtos do localStorage
    let products = JSON.parse(localStorage.getItem('products')) || [];

    // Atualiza a tabela com os dados armazenados
    function updateTable() {
        tableBody.innerHTML = ''; // Limpa as linhas existentes
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.barcode}</td>
                <td>${product.quantity}</td>
            `;
            row.dataset.index = index; // Adiciona o índice para identificação
            tableBody.appendChild(row);
        });
    }

    // Atualiza a tabela na inicialização
    updateTable();

    // Adiciona ou atualiza um produto na lista
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const barcode = document.getElementById('barcode').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        let isFL = false; // Defina isFL conforme necessário

        // Verifica se o produto já existe pelo código de barras
        const existingProduct = products.find(product => product.barcode === barcode);
        if (existingProduct) {
            // Atualiza a quantidade do produto existente
            existingProduct.quantity += quantity;
        } else {
            // Adiciona um novo produto
            products.push({
                barcode,
                quantity,
                isFL // Inclui o campo isFL
            });
        }

        // Atualiza o localStorage e a tabela
        localStorage.setItem('products', JSON.stringify(products));
        updateTable();

        // Limpa o formulário
        form.reset();
    });

    // Gera o arquivo CSV com os dados da tabela
    generateFileButton.addEventListener('click', function () {
        let fileContent ='Codigo Copafer ,Detalhe,Código de Barras,Quantidade,Fora de Linha\n';
        products.forEach(product => {
           fileContent += ` -,-,${product.barcode},${product.quantity},-\n`; // Inclui o campo isFL e nova linha
        });

        // Cria um link para download do arquivo CSV
        const blob = new Blob([fileContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'produtos.csv';
        link.click();
    });

    // Limpa a tabela e o localStorage
    clearTableButton.addEventListener('click', function () {
        confirmationModal.style.display = 'block';
    });

    // Fecha o modal sem fazer nada
    cancelClearButton.addEventListener('click', function () {
        confirmationModal.style.display = 'none';
    });

    // Limpa a tabela e fecha o modal
    confirmClearButton.addEventListener('click', function () {
        products = [];
        localStorage.removeItem('products');
        updateTable();
        confirmationModal.style.display = 'none';
    });

    // Remove o último produto da tabela
    removeLastButton.addEventListener('click', function () {
        if (products.length > 0) {
            products.pop();
            localStorage.setItem('products', JSON.stringify(products));
            updateTable();
        }
    });

    // Permite editar uma linha da tabela ao clicar nela
    tableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        if (row) {
            const index = row.dataset.index; // Obtém o índice da linha clicada
            const product = products[index];

            // Preenche o formulário com os dados da linha selecionada
            document.getElementById('barcode').value = product.barcode;
            document.getElementById('quantity').value = product.quantity;

            // Remove o produto temporariamente para permitir edição
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            updateTable();
        }
    });
});
