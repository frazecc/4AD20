// ** SOSTITUISCI QUESTI VALORI **
const CLIENT_ID = 'IL_TUO_CLIENT_ID_OTTENUTO_IN_FASE_1';
const API_KEY = 'LA_TUA_CHIAVE_API_OTTENUTA_IN_FASE_1'; 
const FOLDER_ID = 'L_ID_DELLA_CARTELLA_DI_DRIVE_OTTENUTO_IN_FASE_1'; 
// ****************************

// Ambito: Permette solo la lettura dei metadati di Drive
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'; 

// Funzione chiamata quando la libreria Google è stata caricata
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Inizializza il client API di Google
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    // Dopo l'inizializzazione, carica l'interfaccia utente (UI) per l'autenticazione
    // (Non gestiamo la login esplicita perché i file sono pubblici,
    // ma l'API ha bisogno di un "caricamento")
    
    // Tentiamo di eseguire la query immediatamente
    listFiles(); 
}

/**
 * Richiede l'elenco dei PDF dalla cartella Drive specificata.
 */
async function listFiles() {
    try {
        const response = await gapi.client.drive.files.list({
            // Filtra per file all'interno della cartella e solo PDF
            q: `'${FOLDER_ID}' in parents and mimeType = 'application/pdf'`,
            pageSize: 100, // Massimo 100 risultati per pagina
            fields: 'files(id, name)', // Chiediamo solo l'ID e il nome
        });

        const files = response.result.files;
        displayFiles(files);

    } catch (err) {
        document.getElementById('file-list-container').innerHTML = 
            '<p style="color: red;">Errore nel caricamento dei file. Controlla la console per i dettagli o verifica che la cartella sia pubblica.</p>';
        console.error('Errore API Drive:', err);
    }
}

/**
 * Visualizza l'elenco dei file come caselle di spunta.
 */
function displayFiles(files) {
    const listContainer = document.getElementById('file-list-container');
    listContainer.innerHTML = ''; // Pulisce il messaggio "Caricamento file..."

    if (!files || files.length === 0) {
        listContainer.innerHTML = '<p>Nessun PDF trovato nella cartella specificata.</p>';
        return;
    }

    const form = document.createElement('form');
    let htmlContent = '<ul>';

    files.forEach((file) => {
        // Creazione di un elemento per ogni file
        htmlContent += `
            <li>
                <input type="checkbox" id="${file.id}" name="pdf_file" value="${file.id}" onchange="selectFile(this)">
                <label for="${file.id}">${file.name}</label>
            </li>
        `;
    });
    htmlContent += '</ul>';

    // Aggiungi un pulsante per visualizzare il PDF selezionato
    htmlContent += '<button type="button" onclick="viewSelectedPdf()">Visualizza PDF Selezionato</button>';
    
    form.innerHTML = htmlContent;
    listContainer.appendChild(form);
}

// Variabile per tenere traccia dell'ID del file selezionato
let selectedFileId = null;

/**
 * Gestisce la selezione della casella di spunta (solo un file alla volta).
 */
function selectFile(checkbox) {
    // Deseleziona tutti gli altri checkbox
    const checkboxes = document.getElementsByName('pdf_file');
    checkboxes.forEach((cb) => {
        if (cb !== checkbox) {
            cb.checked = false;
        }
    });

    if (checkbox.checked) {
        selectedFileId = checkbox.value;
    } else {
        selectedFileId = null;
    }
}

/**
 * Visualizza il PDF selezionato in un iframe.
 */
function viewSelectedPdf() {
    const viewerContainer = document.getElementById('pdf-viewer-container');
    
    if (!selectedFileId) {
        viewerContainer.innerHTML = '<p style="color: orange;">Seleziona prima un file dall\'elenco.</p>';
        return;
    }

    // URL per incorporare il visualizzatore PDF di Google Drive
    const pdfUrl = `https://drive.google.com/file/d/${selectedFileId}/preview`;

    viewerContainer.innerHTML = `
        <h2>Anteprima PDF</h2>
        <iframe src="${pdfUrl}" width="100%" height="600px" style="border: none;"></iframe>
        <a href="${pdfUrl}" target="_blank">Apri in una nuova scheda</a>
    `;
}
