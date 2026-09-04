const result =
    JSON.parse(
        localStorage.getItem(
            "analysisResult"
        ) || "{}"
    );


if (result.confidence) {

    document.getElementById(
        "confidence"
    ).textContent =
        result.confidence;
}


if (result.objects) {

    document.getElementById(
        "objects"
    ).textContent =
        result.objects;
}


if (result.changedArea) {

    document.getElementById(
        "changedArea"
    ).textContent =
        result.changedArea;
}


if (result.interpretation) {

    document.getElementById(
        "interpretationText"
    ).textContent =
        result.interpretation;
}


// JSON export

window.exportJSON = function () {

    const data = {

        product:
            "Cosmo Query",

        system:
            "SatQuery AI",

        generatedAt:
            new Date().toISOString(),

        analysis:
            result

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    downloadBlob(
        blob,
        "cosmo-query-analysis.json"
    );
};


// CSV export

window.exportCSV = function () {

    const rows = [

        [
            "Metric",
            "Value"
        ],

        [
            "Confidence",
            result.confidence || ""
        ],

        [
            "Detected Objects",
            result.objects || ""
        ],

        [
            "Changed Area",
            result.changedArea || ""
        ],

        [
            "Status",
            result.status || ""
        ]

    ];


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(value)
                                    .replaceAll('"','""')}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv"
            }
        );


    downloadBlob(
        blob,
        "cosmo-query-analysis.csv"
    );
};


function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}