var annolist = [];
var modelsList = [];
var addDefectMode = false;
currentAnnotationToCreate = {};
markDefectMode = false;
cameraX = 0;
cameraY = 0;
cameraZ = 0;
targetX = 0;
targetY = 0;
targetZ = 0;
positionX = 0;
positionY = 0;
positionZ = 0;
normalX = 0;
normalY = 0;
normalZ = 0;
var currentAircraftmodelSelected;
var currentAirlineSelected;
var currentRegistrationCodeSelected;
var cameraPosition;
var cameraTarget;
var currentDefectToUpdate;
var currentAnnotationToUpdate;
var sketchFabAPI;
var iframe = document.getElementById('api-frame');
var urlid = 'dbf6450b82a4461c9393dda70fb66a43';
// By default, the latest version of the viewer API will be used.
var client = new Sketchfab(iframe);

// Controls
document.getElementById('markAnno').addEventListener('click', function () {
    markDefectMode = true;
    clearForm();
});
document.getElementById('loadModel').addEventListener('click', function () {
    onLoadmodel();
});
$('#loadAnno').click(function () {
    init();
});
// API
function onSuccess(api) {
    sketchFabAPI = api;
    api.addEventListener('annotationSelect', function (index) {
        if (index != -1) {
            api.getAnnotation(index, function (err, info) {
                if (info) {
                    currentAnnotationToUpdate = info;
                    currentDefectToUpdate = getAnnotationDetails((info.order - 1));
                    setFormDetails(currentDefectToUpdate);
                }
            });
        }
    });
    api.addEventListener('click', function (info) {
        if (info.position2D !== null && markDefectMode) {
            markDefectMode = false;
            positionX = info.position3D[0];
            positionY = info.position3D[1];
            positionZ = info.position3D[2];
            normalX = info.normal[0];
            normalY = info.normal[1];
            normalZ = info.normal[2];
            api.getCameraLookAt(function (err, camera) {
                cameraPosition = camera.position;
                cameraTarget = camera.target;
                document.getElementById('saveAnno').disabled = false;
                document.getElementById('annoRes').style.display = "hidden";
                currentAnnotationToCreate = {
                    pox: positionX,
                    poy: positionY,
                    poz: positionZ,
                    nox: normalX,
                    noy: normalY,
                    noz: normalZ,
                    camPos: cameraPosition,
                    camTarget: cameraTarget,
                    title: 'Title',
                    content: 'Description',
                    user: 'User',
                    date: '10/18/2018',
                    hangerLocation: 'HangerLocation'
                };
                var modelDetails;
                api.createAnnotation(
                    [currentAnnotationToCreate.pox, currentAnnotationToCreate.poy, currentAnnotationToCreate.poz],
                    [currentAnnotationToCreate.nox, currentAnnotationToCreate.noy, currentAnnotationToCreate.noz],
                    currentAnnotationToCreate.camPos,
                    currentAnnotationToCreate.camTarget,
                    currentAnnotationToCreate.title,
                    currentAnnotationToCreate.content,
                    function (index) {
                        api.updateAnnotation(index, {
                            title: currentAnnotationToCreate.title,
                            content: currentAnnotationToCreate.content
                        });
                        currentAnnotationToUpdate = currentAnnotationToCreate;
                        var copiedObject = jQuery.extend(true, {}, currentAnnotationToCreate)
                        checkForModel(copiedObject);
                    }
                );
                //modelsList.push(modelDetails);
                //setFormDetails(currentAnnotationToCreate);
            });
        }
    }, {
        pick: 'fast'
    });
    api.start(function () {
        console.log('started');
        document.getElementById('saveAnno').addEventListener('click', function () {
            currentDefectToUpdate.title = $('#annoName').val();
            currentDefectToUpdate.content = $('#annoDescr').val();
            currentDefectToUpdate.hangerLocation = $('#hangerLocation').val();
            currentDefectToUpdate.date = $('#dateText').val();
            currentDefectToUpdate.user = $('#userName').val();
            api.updateAnnotation(currentAnnotationToUpdate.order, {
                title: currentDefectToUpdate.title,
                content: currentDefectToUpdate.content
            });
        });

        api.addEventListener('viewerready', function () {
            getModelsDetails();
            var currentModel = modelsList.filter(obj => {
                return (obj.aircraftmodel === currentAircraftmodelSelected && obj.airline === currentAirlineSelected &&
                    obj.registrationCode === currentRegistrationCodeSelected)
            });
            if (currentModel.length != 0) {
                currentModel[0].defectsDetails.forEach(function (obj) {
                    console.log('inside create', obj)
                    api.createAnnotation(
                        [obj.pox, obj.poy, obj.poz],
                        [obj.nox, obj.noy, obj.noz],
                        obj.camPos,
                        obj.camTarget,
                        obj.title,
                        obj.content,
                        function (index) {
                            // console.log('added hotspot: ' + index);
                            // api.removeAnnotation(index);
                        }
                    );
                });
            }
        });
    });
};
// Methods
function getAnnotationDetails(index) {
    var currentModel = modelsList.filter(obj => {
        return (obj.aircraftmodel === currentAircraftmodelSelected && obj.airline === currentAirlineSelected && obj.registrationCode ===
            currentRegistrationCodeSelected)
    });
    return currentModel[0].defectsDetails[index];
}

function checkForModel(annotationToAdd) {
    var currentModel = modelsList.filter(obj => {
        return (obj.aircraftmodel === currentAircraftmodelSelected && obj.airline === currentAirlineSelected && obj.registrationCode ===
            currentRegistrationCodeSelected)
    });
    if (currentModel.length === 0) {
        modelDetails = {
            aircraftmodel: currentAircraftmodelSelected,
            airline: currentAirlineSelected,
            registrationCode: currentRegistrationCodeSelected,
            defectsDetails: [annotationToAdd]
        };
        currentDefectToUpdate = modelDetails;
        modelsList.push(modelDetails);
    } else {
        currentDefectToUpdate = currentModel[0];
        currentModel[0].defectsDetails.push(annotationToAdd);
    }
};

function clearForm() {
    $('#annoName').val('');
    $('#annoDescr').val('');
    $('#hangerLocation').val('');
    $('#dateText').val('');
    $('#userName').val('');
    sketchFabAPI.unselectAnnotation();
    document.getElementById('saveAnno').disabled = true;
};

function setFormDetails(info) {
    if (info) {
        $('#annoName').val(info.title);
        $('#annoDescr').val(info.content);
        $('#hangerLocation').val(info.hangerLocation);
        $('#dateText').val(info.date);
        $('#userName').val(info.user);
    }
};

function onLoadmodel() {
    clearForm();
    getModelsDetails();
    document.getElementById('api-frame').src += '';
    client = new Sketchfab(document.getElementById('api-frame'));
    //document.getElementById('api-frame').contentWindow.location.reload();
    client.init(urlid, {
        success: onSuccess,
        error: onError,
        annotation: 0,
        annotations_visible: 1,
        ui_controls: 0

    });
};

function onError(error) {
    console.log(error);
};

function getModelsDetails() {
    currentAircraftmodelSelected = $('#aircraftmodel').val();
    currentAirlineSelected = $('#airline').val();
    currentRegistrationCodeSelected = $('#registration').val();
};

function init() {
    if (modelsList.length === 0) {
        modelDetails = {
            aircraftmodel: currentAircraftmodelSelected,
            airline: currentAirlineSelected,
            registrationCode: currentRegistrationCodeSelected,
            defectsDetails: []
        };
        modelsList.push(modelDetails);
        client.init(urlid, {
            success: onSuccess,
            error: onError,
            annotation: 0,
            annotations_visible: 1,
            ui_controls: 0

        });
    }
};
init();