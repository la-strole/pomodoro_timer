document.addEventListener("DOMContentLoaded", function() {

    const display_elements = {
        minute_tag : document.querySelector("#minute"),
        second_tag : document.querySelector("#second"),
        tree_tag : document.querySelector("#current_tree"),
        pause_button_tag : document.querySelector("#btn_pause"),
        stop_button_tag : document.querySelector('#btn_stop'),
        pomo_in_row_count_tag : document.querySelector('#row_pomo_number'),
    };
    // settings object
    const settings = {
        pomo_minute: 25,
        break_m: 5,
        lbreak_m: 30,
        lbr_after: 4,
        pomodoro_session: true,
    };

    const controlls = {
        is_paused_flag : false,
        is_stop_flag : true
    };

    const states = {
        pomo_in_row : 0,
        time_start : 0,
        timer_minute : 25,
        timer_second : 0,
        breaking_time : false,
        step_minute : parseFloat(1)
    }


    function play_sound(){
        let audio = new Audio('static/bell.wav');
        audio.play();
        console.log('play sound');
    }

    function formated_time(t) {
        return `${("0" + t).slice(-2)}`;
    }

    function get_current_time() {
        let d = new Date();
        return `${formated_time(d.getHours())}:${formated_time(d.getMinutes())}`;
    }

    function add_pomo_row_card() {
        let card_existed = document.querySelector('#row_pomo_card');
        if (!card_existed) {
            let row_pomo_card = document.createElement('div');
            row_pomo_card.setAttribute("class", "card");
            row_pomo_card.setAttribute("style", "width: 18rem;");
            row_pomo_card.setAttribute("id", "row_pomo_card");
            row_pomo_card.innerHTML = `
                <div class="card-body">
                    <p class="card-text" id="row_pomo_number">
                        ${states.pomo_in_row} pomodoro in a row
                    </p>
                </div>`
            document.getElementById("control_div").appendChild(row_pomo_card);
            console.log('Add row pomo card');
        }
        else {
            console.log("Try to add row pomo card, but it existed.");
        } 
    };

    function remove_pomo_row_card() {
        let card_existed = document.querySelector('#row_pomo_card');
        if (card_existed) {
            document.getElementById("row_pomo_card").remove();
        }
    };

    function pomo_time() {
        display_elements.tree_tag.classList.remove("mx-auto", "my-auto", "d-block", "w-75");
        display_elements.tree_tag.src = 'static/tree/1.jpg';
        // Initialize pomo timer
        states.timer_minute = settings.pomo_minute;
        states.timer_second = 0;
        display_elements.minute_tag.innerHTML = `${formated_time(settings.pomo_minute)}:`;
        display_elements.second_tag.innerHTML = `00`;
        document.title = `${formated_time(settings.pomo_minute)}:00`;
    }

    function break_time() {
        let is_long_break = (states.pomo_in_row % settings.lbr_after === 0 && states.pomo_in_row > 0) ? true : false;
        display_elements.tree_tag.src = `static/break.gif`;
        display_elements.tree_tag.classList.add("mx-auto", "my-auto", "d-block", "w-75");
        // Initialize break timer
        states.timer_minute = is_long_break ? settings.lbreak_m : settings.break_m;
        states.timer_second = 0;
        if (is_long_break) {
            display_elements.minute_tag.innerHTML = `${formated_time(settings.lbreak_m)}:`;
            display_elements.second_tag.innerHTML = `00`;
            document.title = `${formated_time(settings.lbreak_m)}:00`;
        }
        else {
            display_elements.minute_tag.innerHTML = `${formated_time(settings.break_m)}:`;
            display_elements.second_tag.innerHTML = `00`;
            document.title = `${formated_time(settings.break_m)}:00`;
        }
    };
    function change_timer(minute, second) {
        display_elements.minute_tag.innerHTML = formated_time(minute) + ":";
        display_elements.second_tag.innerHTML = formated_time(second);
        document.title = `${formated_time(minute)}:${formated_time(second)}`;
    }
    function change_tree() {
        let number = parseInt((settings.pomo_minute * 60) - ((states.timer_minute * 60) + states.timer_second));
        let img_num = Math.ceil(number * states.step_minute) + 1;
        if (img_num < 1) {
            img_num = 1;
        }
        else if (img_num > 26) {
            img_num = 26;
        }
        display_elements.tree_tag.src = `static/tree/${img_num}.jpg`;
    }

    function add_tree_to_garden(){
        // Get current tree image
        
        const garden_tree_width = Math.floor(display_elements.tree_tag.clientWidth / 2);
        const garden_tree_height = Math.floor(display_elements.tree_tag.clientHeight / 2);
        const current_date = new Date();

        // Add new tree to the garden
    
        time_end = get_current_time();
        let garden_tree = document.createElement("div");
        garden_tree.setAttribute("class", "col d-flex justify-content-center text-center");
        garden_tree.innerHTML = `
            <div class="card shadow-lg">
                <img src="${display_elements.tree_tag.src}" alt="growing tree" class="img-fluid garden_tree" width="${garden_tree_width}px" height="${garden_tree_height}px">
            <div class="card-body p-0 mb-1">
            <p class="card-text">
                <div id="garden_tree_date">
                    ${current_date.toDateString()}
                </div>
                <div id=""garden_tree_time>
                    <span id="garden_tree_time_start">${states.time_start} - </span>
                    <span id="garden_tree_time_end">${time_end}</span>
                </div>      
            </div>
            </div>
        `;
        document.getElementById("garden").appendChild(garden_tree);
        console.log('Add tree to the garden');
    }
    // Add <pomo in row> section by default
    add_pomo_row_card();
    // Add default pomo view
    pomo_time();
    // Initialize default step minute
    states.step_minute = 26 / (settings.pomo_minute * 60);
    // Inititialize tag pomo in row count
    display_elements.pomo_in_row_count_tag = document.querySelector('#row_pomo_number');
    // Create bootstrap offcanvas instance
    const myOffcanvas = document.querySelector('#myOffcanvas');
    const offcanvas = new bootstrap.Offcanvas(myOffcanvas);
    offcanvas.backdrop = false;
    offcanvas.keyboard = false;
    offcanvas.scroll = false;
    // Run offcanvas on the top of the screen
    offcanvas.show();
    // Get settings from offcanvas form
    document.getElementById('settings_form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior
    
        const formData = new FormData(this); // Create a FormData object from the form
        // Access form data and store it in local JavaScript variables
        settings.pomo_minute = parseInt(formData.get('pomo_set_minutes'));
        settings.break_m = parseInt(formData.get('br_set_minutes'));
        settings.lbreak_m = parseInt(formData.get('lbr_set_minutes'));
        settings.lbr_after = parseInt(formData.get('lbr_after'));
        let swich_state = document.getElementById('breaks');
        settings.pomodoro_session = swich_state.checked ? true : false;
        // Delete pomo in line section if use as timer
        if (!settings.pomodoro_session) {
            remove_pomo_row_card();
        }
        // Renew new step minute from form
        states.step_minute = 26 / (settings.pomo_minute * 60);
        // Renew pomo view with data from form
        pomo_time();
        console.log("Settings updated");
        offcanvas.hide();
        console.log("Offcanvas confirmed");
    });
        
    // Event handlers for buttons
    display_elements.stop_button_tag.addEventListener("click", function(){
        if (this.value === "start") {
            // Begin pomodoro 
            this.value = "stop";
            this.innerHTML = "Stop";
            states.pomo_in_row = 0;
            // Upgrade display tag
            display_elements.pomo_in_row_count_tag.innerHTML = `${states.pomo_in_row}  pomodoro in a row`;
            // Enable pause button
            display_elements.pause_button_tag.value = "pause";
            display_elements.pause_button_tag.innerHTML = "Pause";
            display_elements.pause_button_tag.disabled = false;
            // Begin timer
            controlls.is_stop_flag = false;
            controlls.is_paused_flag = false;
            states.time_start = get_current_time();
            states.breaking_time = false;
            
            console.log("Started by button");
        } else {
            // Stop timer
            controlls.is_stop_flag = true;
            // Disable pause button
            display_elements.pause_button_tag.disabled = true;
            // If it is not breaking time - plant the tree
            if (! states.breaking_time){
                add_tree_to_garden();
            }
            play_sound();
            this.value = "start";
            this.innerHTML = "Start"
            // Update display to new pomo
            pomo_time();
            console.log("Stop by button");
        }   
    });

    display_elements.pause_button_tag.addEventListener("click", function(){
        if (this.value === "pause") {
            controlls.is_paused_flag = true;
            this.value = "resume";
            this.innerHTML = "Resume";
            console.log("Paused by button");
        } else {
            controlls.is_paused_flag = false;
            this.value = "pause";
            this.innerHTML = "Pause";
            console.log("Resumed by button");
        }
    });
    
    setInterval(function() {
        let timer_active = !controlls.is_paused_flag && !controlls.is_stop_flag;
        
        if (timer_active) {

            // If stoped by timer
            if (states.timer_minute === 0 && states.timer_second === 0) {
                // If pomodoro session
                if (settings.pomodoro_session) {
                    // If it is end of pomodoro - begin breaking time
                    if (!states.breaking_time){
                        play_sound();
                        add_tree_to_garden();
                        states.pomo_in_row++;
                        display_elements.pomo_in_row_count_tag.innerHTML = `${states.pomo_in_row}  pomodoro in a row`;
                        states.breaking_time = true;
                        break_time();
                        
                    }
                    // If it is end of breaking time - begin new pomodoro
                    else {
                        states.breaking_time = false;
                        play_sound();
                        console.log("End breaking time");
                        states.time_start = get_current_time();
                        pomo_time();
                    }
                }
                else {
                    controlls.is_stop_flag = true;
                    console.log("Stop by timer");
                    add_tree_to_garden();
                    play_sound();
                    pomo_time();
                    display_elements.pause_button_tag.disabled = true;
                    display_elements.stop_button_tag.value = "start";
                    display_elements.stop_button_tag.innerHTML = "Start"
                    states.breaking_time = false;
                    states.pomo_in_row = 0;                     
                }
            }
            // Timer active
                // To new minute
            if (states.timer_second === 0) {
                    states.timer_minute--;
                    states.timer_second = 60;
            }
            // tree growing
            if (! states.breaking_time) {
                change_tree();
            }
                
            // Time going
            states.timer_second--;
            change_timer(states.timer_minute, states.timer_second);
        }        
    }, 1000);
});

