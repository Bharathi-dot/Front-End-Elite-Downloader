document.addEventListener("DOMContentLoaded", function () {

    //-----------------Show the popup when the page loads-----------------//
    document.getElementById('disclaimer-popup').style.display = 'flex';

    // Enable the button when the checkbox is checked
    document.getElementById('agree-checkbox').addEventListener('change', function () {
        document.getElementById('agree-button').disabled = !this.checked;
    });

    // Hide the popup when the user clicks "Continue"
    document.getElementById('agree-button').addEventListener('click', function () {
        document.getElementById('disclaimer-popup').style.display = 'none';
    });
    //=======================//========================//


    //-----------For guide button----------//

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const navbarHeight = document.querySelector('.navbar').offsetHeight;

            window.scrollTo({
                top: targetElement.offsetTop - navbarHeight, // Adjust scroll position by navbar height
                behavior: 'smooth'
            });
        });
    });

    //================//=============//




    var apiEndPoint = "https://api.elitedownloader.in";
    let selectedResolution = '';
    let selectedFormat = '';
    var url = '';
    let ResolutionapiResponse = '';

    // Add non-clickable class to option buttons on page load
    const optionButtons = document.querySelectorAll(".option");

    optionButtons.forEach(button => {
        button.classList.add("non-clickable");

    });
    //=======//========//

    // --- For dropdown selecting purpose --- //
    let locationButtons = document.getElementsByClassName('location');

    Array.from(locationButtons).forEach(function (locationButton) {
        locationButton.addEventListener('click', pressedLocation);
    });

    function pressedLocation() {
        let selected = document.getElementsByClassName('location--selected');
        if (selected.length > 0) {
            selected[0].classList.remove('location--selected');
        }
        this.classList.add('location--selected');
        console.log('Selected location:', this.getAttribute('location')); // Debugging log
    }

    // --- For dropdown arrow toggle --- //
    document.getElementsByClassName('drop-arrow')[0].addEventListener('click', dropButton);

    function dropButton() {
        this.classList.toggle('button--pushed');
        document.getElementsByClassName('location-container')[0].classList.toggle('opened');
        console.log('Dropdown toggled'); // Debugging log
    }

    // Function to reset icon classes and remove specific selected classes
    function resetIconClasses() {
        document.querySelectorAll('.location').forEach(location => {
            location.classList.remove('instagram-selected', 'youtube-selected');
            const icon = location.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-shake', 'fa-bounce');
            }
        });
        console.log('Reset icon classes');
    }

    // Event listener for Instagram selection
    document.querySelector('.location[location="INSTAGRAM"]').addEventListener('click', function () {
        resetIconClasses(); // Reset classes first
        this.classList.add('instagram-selected'); // Add Instagram-specific class
        this.querySelector('i').classList.add('fa-shake'); // Apply shake effect to icon

    });

    // Event listener for YouTube selection
    document.querySelector('.location[location="YOUTUBE"]').addEventListener('click', function () {
        resetIconClasses(); // Reset classes first
        this.classList.add('youtube-selected'); // Add YouTube-specific class
        this.querySelector('i').classList.add('fa-bounce'); // Apply bounce effect to icon

    });



    //==========//============//


    // -----For grid layout changing-----//
    document.querySelector('.container').classList.add('fetch-layout');

    const fetchButton = document.getElementById('fetchbtn');
    const downloadButton = document.getElementById('download');


    // Function to simulate an API call and enable resolution buttons based on response

    let apiResponse = {};

    document.getElementById('fetchbtn').addEventListener('click', () => {

        var notyf = new Notyf();


        let selectedPlatformElement = document.querySelector('.location--selected p');
        let selectedPlatform = selectedPlatformElement ? selectedPlatformElement.innerText.trim().toLowerCase() : null;
        let url = document.getElementById('videoUrl').value.trim().toLowerCase();


        // Check if the URL is entered and the dropdown option is selected
        if (url === '' || !(url.includes("https://youtube.com/shorts") || url.includes('https://youtu.be') || url.includes('https://www.instagram.com'))) {
            // If URL is empty or URL does not contain the required domains
            notyf.error({
                message: 'Enter a Valid URL',
                className: 'toast-margin'
            });

        } else if (selectedPlatform === null) {
            // If no platform is selected
            notyf.error({
                message: 'Select a format from the dropdown menu',
                className: 'toast-margin'
            });
        } else if ((url.includes('instagram') && selectedPlatform === 'youtube') ||
            (url.includes('youtu') && selectedPlatform === 'instagram')) {
            // If URL and platform do not match
            notyf.error({
                message: 'Wrong format selected',
                className: 'toast-margin'
            });
        } else {
            // Both conditions are met, proceed with enabling buttons and layout change
            optionButtons.forEach(button => {
                button.classList.remove("non-clickable");
            });

            fetchResolution();

            // Disable the fetch button and enable the download button
            fetchButton.style.display = "none";
            downloadButton.style.display = "block";

            // Change the grid-template-rows by toggling the class
            const container = document.querySelector('.container');
            container.classList.remove('fetch-layout');
            container.classList.add('submit-layout');
        }

    });

    async function fetchResolution() {
        document.querySelector('.loader-container').style.display = 'flex';

        const url = document.getElementById('videoUrl').value;
        let selectedPlatform = document.querySelector('.location--selected p').innerText.trim().toLowerCase(); // will be either 'instagram' or 'youtube'

        try {
            const response = await fetch(`${apiEndPoint}/api/VideoProcessing/get-resolutions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, isInstagram: selectedPlatform == 'instagram' })
            }).finally(() => {
                // Hide the loader
                document.querySelector('.loader-container').style.display = 'none';
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data.resolutions)

            // Store the API response
            ResolutionapiResponse = data;
            enableResolutionButtons(ResolutionapiResponse.resolutions);  // Use the stored response to enable buttons

            // ----- Displaying thumbnail ---- //

            if (ResolutionapiResponse.thumbnailUrl) {
                const thumbnailElement = document.querySelector('.avatar');
                if (ResolutionapiResponse.thumbnailUrl.startsWith('data:image')) {
                    // Instagram thumbnail (Base64)
                    thumbnailElement.style.backgroundImage = `url(${ResolutionapiResponse.thumbnailUrl})`;
                } else {
                    // YouTube thumbnail (URL)
                    thumbnailElement.style.backgroundImage = `url(${ResolutionapiResponse.thumbnailUrl})`;
                }
            }

            // =========== // ============== //

        } catch (error) {
            console.error('Error fetching resolutions:', error);
        }
    }

    function enableResolutionButtons(resolutions) {


        // Iterate over each resolution and enable/disable buttons accordingly
        if (!resolutions["240p"]) disableButtonAndShowIcon("240");
        if (!resolutions["360p"]) disableButtonAndShowIcon("360");
        if (!resolutions["480p"]) disableButtonAndShowIcon("480");
        if (!resolutions["720p"]) disableButtonAndShowIcon("720");
        if (!resolutions["1080p"]) disableButtonAndShowIcon("1080");
        if (!resolutions["1440p"]) disableButtonAndShowIcon("1440");
        if (!resolutions["2160p"]) disableButtonAndShowIcon("2160");
        if (!resolutions["4320p"]) disableButtonAndShowIcon("4320");
    }

    function disableButtonAndShowIcon(resolution) {
        // Select the button for the specific resolution
        let button = document.querySelector(`.resolution[data-value="${resolution}"]`);

        if (button) {
            // Find the cross icon in the same option-wrapper
            let icon = button.closest('.option-wrapper').querySelector('.cross-icon');

            // Disable the button and show the cross icon
            button.disabled = true;
            icon.hidden = false;  // Make the cross icon visible
        } else {
            console.error(`Button for resolution ${resolution} not found.`);
        }
    }
    document.querySelectorAll('.option').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    function handleButtonClick(event) {
        const clickedButton = event.target;


        if (clickedButton.classList.contains('resolution')) {
            document.querySelector('.check').style.display = 'none';  // Show check.webp
            document.querySelector('.video').style.display = 'block';   // Hide video.gif

            selectedResolution = clickedButton.getAttribute('data-value');
            setAllButtonsActive();
            setButtonInsetShadow(clickedButton, true);
            if (selectedFormat) {
                setButtonInsetShadow(document.querySelector(`.${selectedFormat}`), true);
            }
            if (selectedFormat === 'video-only') {
                setButtonsInactive(['audio-only']); // Ensure these buttons remain disabled
            }
            enableResolutionButtons(ResolutionapiResponse.resolutions);
        } else if (clickedButton.classList.contains('audio-only')) {

            document.querySelector('.check').style.display = 'none';  // Show check.webp
            document.querySelector('.video').style.display = 'block';   // Hide video.gif

            selectedFormat = 'audio-only';
            setAllButtonsInactive();
            setButtonsActive(['audio-only', 'video-only', 'audiovideo']);
            setButtonInsetShadow(clickedButton, true);
            enableResolutionButtons(ResolutionapiResponse.resolutions);
        } else if (clickedButton.classList.contains('video-only')) {

            document.querySelector('.check').style.display = 'none';  // Show check.webp
            document.querySelector('.video').style.display = 'block';   // Hide video.gif

            selectedFormat = 'video-only';
            setAllButtonsActive();
            setButtonInsetShadow(clickedButton, true);
            if (selectedResolution) {
                setButtonInsetShadow(document.querySelector(`.resolution[data-value="${selectedResolution}"]`), true);
            }
            // Ensure audiovideo button is enabled
            document.querySelector('.audiovideo').disabled = false;
            enableResolutionButtons(ResolutionapiResponse.resolutions);
        } else if (clickedButton.classList.contains('audiovideo')) {

            document.querySelector('.check').style.display = 'block';  // Show check.webp
            document.querySelector('.video').style.display = 'none';   // Hide video.gif

            selectedFormat = 'audiovideo';
            setAllButtonsActive();
            setButtonInsetShadow(clickedButton, true);
            if (selectedResolution) {
                setButtonInsetShadow(document.querySelector(`.resolution[data-value="${selectedResolution}"]`), true);
            }
            // Ensure video-only button is enabled
            document.querySelector('.video-only').disabled = false;
            enableResolutionButtons(ResolutionapiResponse.resolutions);
        }
    }

    function setAllButtonsActive() {
        document.querySelectorAll('.option').forEach(button => {
            button.disabled = false;
            setButtonInsetShadow(button, false);


            const crossIcon = button.parentElement.querySelector('.cross-icon');
            if (crossIcon) {
                crossIcon.hidden = true; // Show cross-icon
            }
        });
    }

    function setAllButtonsInactive() {
        document.querySelectorAll('.option').forEach(button => {
            button.disabled = true;
            setButtonInsetShadow(button, false);

            const crossIcon = button.parentElement.querySelector('.cross-icon');
            const okIcon = button.parentElement.querySelector('.ok-icon');

            if (crossIcon) {
                crossIcon.hidden = false; // Show cross-icon
            }

            // Optionally hide the check-icon if needed
            if (okIcon) {
                okIcon.hidden = true; // Hide ok-icon
            }
        });
    }

    function setButtonsActive(buttonClasses) {
        buttonClasses.forEach(buttonClass => {
            const button = document.querySelector(`.${buttonClass}`);
            if (button) {
                button.disabled = false;

                const crossIcon = button.parentElement.querySelector('.cross-icon');
                const okIcon = button.parentElement.querySelector('.ok-icon');

                if (crossIcon) {
                    crossIcon.hidden = true; // Show cross-icon
                }

                // Optionally hide the check-icon if needed
                if (okIcon) {
                    okIcon.hidden = true; // Hide ok-icon
                }
            }
        });
    }

    function setButtonsInactive(buttonClasses) {
        buttonClasses.forEach(buttonClass => {
            const button = document.querySelector(`.${buttonClass}`);
            if (button) {
                button.disabled = true;
            }
        });
    }

    function setButtonInsetShadow(button, isInset) {
        if (isInset) {
            button.style.boxShadow = 'var(--box-shadow-inset)';
            const okIcon = button.parentElement.querySelector('.ok-icon');
            if (okIcon) {
                okIcon.hidden = false; // Show ok-icon
            }
            const crossIcon = button.parentElement.querySelector('.cross-icon');
            if (crossIcon) {
                crossIcon.hidden = true; // Hide cross-icon
            }
        } else {
            button.style.boxShadow = 'var(--box-shadow)';
            const okIcon = button.parentElement.querySelector('.ok-icon');
            if (okIcon) {
                okIcon.hidden = true; // Hide ok-icon
            }
            const crossIcon = button.parentElement.querySelector('.cross-icon');
            if (crossIcon) {
                crossIcon.hidden = false; // Show cross-icon
            }
        }
    }



    // for other 3 api
    document.getElementById('download').addEventListener('click', handleDownload);

    async function handleDownload() {
        // Validation: Ensure resolution is selected for "video only" and "audiovideo" formats
        if ((selectedFormat === 'video-only' || selectedFormat === 'audiovideo') && !selectedResolution) {
            Swal.fire({
                title: "Resolution Required",
                text: "Please select a resolution before proceeding.",
                icon: "warning",
                confirmButtonColor: "#3085d6",
                customClass: {
                    popup: 'sweetAlertContainer'
                },
                confirmButtonText: "OK",
            });
            return; // Exit the function if resolution is not selected
        }

        document.querySelector('.loader-container').style.display = 'flex';
        let selectedPlatform = document.querySelector('.location--selected p').innerText.trim().toLowerCase(); // will be either 'instagram' or 'youtube'
        let url = document.getElementById('videoUrl').value;
        let apiEndpoint;
        let payload;

        if (selectedFormat === 'audio-only') {
            apiEndpoint = `${apiEndPoint}/api/VideoProcessing/download-best-audio`;
            payload = { Url: url, isInstagram: selectedPlatform == 'instagram' };
        } else if (selectedFormat === 'video-only') {
            apiEndpoint = `${apiEndPoint}/api/VideoProcessing/download-best-video`;
            payload = { Url: url, Quality: selectedResolution, isInstagram: selectedPlatform == 'instagram' };

        } else if (selectedFormat === 'audiovideo') {
            apiEndpoint = `${apiEndPoint}/api/VideoProcessing/download-Video-Audio`;
            payload = { Url: url, Quality: selectedResolution, isInstagram: selectedPlatform == 'instagram' };
        }
        const startByte = 0; // Start from the first byte
        const chunkSize = 1048576; // 1 MB chunk size (in bytes)
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Range': `bytes=${startByte}-${chunkSize - 1}`
                },
                body: JSON.stringify(payload)
            });
        
            if (response.ok) {
                // Extract filename from Content-Disposition header
                let contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'default-filename.m4a'; // Default filename in case extraction fails
        
                if (contentDisposition) {
                    // Check for UTF-8 filename first
                    let filenameEncodedMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/);
                    if (filenameEncodedMatch) {
                        filename = decodeURIComponent(filenameEncodedMatch[1].replace(/['"]/g, ''));
                    } else {
                        // Fallback to normal filename
                        let filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                        if (filenameMatch) {
                            filename = filenameMatch[1];
                        }
                    }
                }
        
                // Create a temporary anchor element, but do not automatically click it
                let downloadUrl = window.URL.createObjectURL(await response.blob());
                let downloadLink = document.createElement('a');
                downloadLink.style.display = 'none'; // Initially hidden
        
                downloadLink.href = downloadUrl;
                downloadLink.download = filename; // Use extracted or default filename
                downloadLink.innerText = 'Click here to download the file'; // Add text to the link
        
                // Append the link to the document body or some container element
                document.body.appendChild(downloadLink);
        
                // After successful request, display the download link for manual click
                Swal.fire({
                    title: "Download Ready!",
                    html: `<a href="${downloadUrl}" download="${filename}" style="color: #3085d6; text-decoration: underline;">Click here to download your file</a>`,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK"
                });
        
                // Now request the rest of the file from 1 MB onwards
                const fileSize = response.headers.get('Content-Length');
                if (fileSize) {
                    let responseRest = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Range': `bytes=${chunkSize}-` // Continue downloading from 1 MB onwards
                        },
                        body: JSON.stringify(payload)
                    });
        
                    if (responseRest.ok) {
                        // Handle the rest of the file similarly
                        let downloadUrlRest = window.URL.createObjectURL(await responseRest.blob());
                        let aRest = document.createElement('a');
                        aRest.style.display = 'none';
                        aRest.href = downloadUrlRest;
                        aRest.download = filename;
                        document.body.appendChild(aRest);
                        window.URL.revokeObjectURL(downloadUrlRest);
                        // Hide the loader
                        document.querySelector('.loader-container').style.display = 'none';
                    }
                }
        
            } else {
                const result = await response.text();
                Swal.fire({
                    title: "Download Failed",
                    text: `Error: ${result.message}`,
                    icon: "error",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK"
                });
                document.querySelector('.loader-container').style.display = 'none';
            }
        
            // Call the reset function here
            resetButtons();
        } catch (error) {
            console.error('Error during download:', error);
            document.querySelector('.loader-container').style.display = 'none';
        
            Swal.fire({
                title: "Download Failed",
                text: "An error occurred while processing your download request.",
                icon: "error",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK"
            });
            document.querySelector('.loader-container').style.display = 'none';

        }
        
    }

    //for nav icons toogle 

    const contactLink = document.getElementById('contact-link');
    const guideLink = document.getElementById('guide-link');

    const contactIcon = document.getElementById('contact-icon');
    const guideIcon = document.getElementById('guide-icon');

    // Default icons
    const contactOutline = 'contact-outline.webp';
    const contactSolid = 'contact-solid.webp';
    const guideOutline = 'guide-outline.webp';
    const guideSolid = 'guide-solid.webp';

    // Click event for Contact link
    contactLink.addEventListener('click', function () {
        contactIcon.src = contactSolid;
        guideIcon.src = guideOutline; // Ensure the guide icon reverts to the outline version
    });

    // Click event for Guide link
    guideLink.addEventListener('click', function () {
        guideIcon.src = guideSolid;
        contactIcon.src = contactOutline; // Ensure the contact icon reverts to the outline version
    });
    //======================//=====================


    // reset all previous positions

    function resetButtons() {

        // Reset selected resolution and format
        selectedResolution = '';
        selectedFormat = '';
        document.getElementById('videoUrl').value = '';


        // Set all buttons to their initial state
        optionButtons.forEach(button => {
            button.disabled = false;
            setButtonInsetShadow(button, false);
            button.classList.add("non-clickable");
        });

        // Hide download button and show fetch button
        fetchButton.style.display = "block";
        downloadButton.style.display = "none";

        // Reset the container layout
        const container = document.querySelector('.container');
        container.classList.remove('submit-layout');
        container.classList.add('fetch-layout');


        // Reset avatar background image
        const thumbnailElement = document.getElementById('thumbnail');
        thumbnailElement.style.backgroundImage = 'url("/images/replace-image.webp")'; // or any default image

        document.querySelectorAll('.cross-icon').forEach(okIcon => {
            okIcon.hidden = true; // Example: Hide all ok-icons as well
        });
    }
    //-------for scrolling animation----------//
    const observer = new IntersectionObserver(entries => {
        // Loop over the entries
        entries.forEach(entry => {
            // If the element is visible
            if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('scroll-animation');
            }
        });
    });

    const viewbox = document.querySelectorAll('.scroll');
    viewbox.forEach(image => {
        observer.observe(image);
    });
    //  ==============//==========//

})
