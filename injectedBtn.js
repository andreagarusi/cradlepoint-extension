function handleMutation(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // l'elemento cp-app-header-buttons è nel DOM
            var headerButtons = document.querySelector('.cp-app-header-buttons');
            if (headerButtons && !document.getElementById('injected-btn')) {
                var injectedBtn = document.createElement('button');

                // creazione div interno con classe cp-tooltip per applicare stile testo btn
                var tooltipDiv = document.createElement('div');
                tooltipDiv.classList.add('cp-tooltip');
                tooltipDiv.textContent = 'Start querying';

                injectedBtn.appendChild(tooltipDiv);

                injectedBtn.id = 'injected-btn';
                injectedBtn.classList.add('cp-button', 'cp-shell-toggle');

                injectedBtn.addEventListener('click', function() {
                    var url = prompt('Inserisci l\'URL dei dati:');
                    if (url) {
                        handleQuerying(url);
                    } else {
                        alert('Prompt inserito non valido o assente.');
                    }
                });

                headerButtons.insertBefore(injectedBtn, headerButtons.firstChild);

                observer.disconnect();
            }
        }
    }
}

var responsesObject = {};

async function handleQuerying(url) {
    try {
        var response = await fetch(url);

        if (!response.ok) {
            throw new Error('response error:' + response.status);
        }

        var jsonifiedResponse = await response.json();

        responsesObject[url] = jsonifiedResponse;

        if (jsonifiedResponse.meta.next && jsonifiedResponse.meta.next !== null) {
            handleQuerying('https://' + window.location.hostname + jsonifiedResponse.meta.next);
        } else if (jsonifiedResponse.meta.next === null) {
            downloadFileJson(responsesObject);
        }

    } catch (error) {
        console.error('fetch error:', error.message);
    }
}

function downloadFileJson(array) {
    var jsonContent = JSON.stringify(array, null, 2);
    var blob = new Blob([jsonContent], { type: 'application/json' });

    var now = new Date();
    var currentHourDate = now.toISOString().replace(/[:.]/g, "-");
    var nomeFile = 'response_' + currentHourDate + '.json';

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomeFile;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

var observer = new MutationObserver(handleMutation);

// configurazione dell'observer per controllare i cambiamenti nel DOM
var config = { childList: true, subtree: true };

observer.observe(document.body, config);