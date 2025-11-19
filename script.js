// ** VALORI CONFIGURATI PER IL PROGETTO "4AD20" **

// ID Client (da Google Cloud Console)
const CLIENT_ID = '761572343886-0vltom1r841bigibhv7u0u9q7en99hph.apps.googleusercontent.com';

// Chiave API (da Google Cloud Console)
const API_KEY = 'AIzaSyBPO2PX97SpA_2XqXjv-iR_Hjxr-RY7v7I'; 

// ID della cartella di Google Drive (1mIa9ygyRsmvQyu_ciaIBBL41rmX4j9NI)
const FOLDER_ID = '1mIa9ygyRsmvQyu_ciaIBBL41rmX4j9NI'; 
// **********************************************

// Ambito: Permette solo la lettura dei metadati di Drive
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'; 

// Funzione chiamata dalla libreria GAPI quando è pronta. (Sintassi Standard)
function gapiLoaded() {
    console.log('START: GAPI Client Library caricata. Carico il modulo "client".');
    gapi.load('client', initializeGapiClient);
}

// Inizializza il client API di Google
async function initializeGapiClient() {
    console.log('PASSAGGIO 1: Inizializzazione GAPI avviata.');
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            // *** IMPORTANTE: INCLUDIAMO L'ID CLIENT ANCHE QUI ***
            clientId: CLIENT_ID, 
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        
        console.log('PASSAGGIO 2: Inizializzazione GAPI completata con successo. Avvio listFiles().');
        listFiles(); 

    } catch (err) {
        // Cattura gli errori di inizializzazione (es. 401/403 se ID Client è sbagliato)
        console.error('ERRORE CRITICO DI INIZIALIZZAZIONE:', err); 
        document.getElementById('file-list-container').innerHTML = 
             '<p style="color: red;">ERRORE FATALE: Impossibile inizializzare l\'API. Controlla la Console per i dettagli (Problema di Chiave, ID Client o Restrizioni OAuth).</p>';
    }
}

/**
 * Richiede l'elenco dei PDF dalla cartella Drive specificata.
 */
async function listFiles() {
    console.log('PASSAGGIO 3: Esecuzione query API Drive in corso...');
    try {
        const response = await gapi.client.drive.files.list({
            // Filtra per file all'interno della cartella e solo PDF
            q: `'${FOLDER_ID}' in parents and mimeType = 'application/pdf'`,
            pageSize: 100, // Massimo 100 risultati per pagina
            fields: 'files(id, name)', // Chiediamo solo l'ID e il nome
        });

        console.log('PASSAGGIO 4: Dati ricevuti! Numero di file:', response.result.files.length);
        const files = response.result.files;
        displayFiles(files);

    } catch (err) {
        document.getElementById('file-list-container').innerHTML = 
            '<p style="color: red;">ERRORE LISTA FILE: Fallimento nella richiesta dei file (Controllo Permessi Drive e ID Cartella).</p>';
        console.error('ERRORE API DRIVE LIST FILES:', err);
    }
}

/**
 * Visualizza l'elenco dei file come caselle di spunta.
 */
function displayFiles(files) {
    const listContainer = document.getElementById('file-list-container');
    listContainer.innerHTML = ''; // Pulisce il messaggio "Caricamento file..."

    if (!files || files.length === 0) {
        listContainer.innerHTML = '<p>Nessun PDF trovato nella cartella specificata (o i file non sono pubblici).</p>';
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
        <a href="https://drive.google.com/file/d/${selectedFileId}/view?usp=sharing" target="_blank">Apri in una nuova scheda</a>
    `;
}
