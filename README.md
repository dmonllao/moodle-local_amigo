Moodle amigo is Chuck Norris. He squires you through your learning adventure.

**Moodle amigo:**
- Observes your activity across the whole session, storing the number of active (and inactive) seconds you spend in each moodle page you visit.
- Analyses your session information to infer if you are (or got) distracted or if you are not using your time in a productive way.
- Pokes you about different stuff that affects you.
- Allows admins to disable specific pokes.

![Moodle amigo screenshot](https://github.com/dmonllao/moodle-local_amigo/raw/master/pix/your-moodle-amigou.png)

This plugin is JS-based so there is no extra workload for the web server. The plugin provides a JS module (something like a mood API) so it is easy to add new JS pokes.

**What does Moodle amigo poke me about?**
- Recommends you to rest after more than 1 hour reading the same resource (It has been observed that when people try to read for long hours, they seldom are able to grasp concepts. But having spent some time reading gives them a false sense of understanding it. - https://github.com/MayankR/OpenEdAI-Hackathon)
- Encourages to return to Moodle after spending some time in other windows 
- Sends you welcome messages depending on the time of the day (something like what facebook does)

**Future work**
  - Replace hardcoded language strings by standard language strings so they can be translated and edited. 
  - New pokes:
    - Congratulates you after being actively working in Moodle for a while.
    - Encourages you to keep pushing after failing a quiz.
    - Cheers you up after abandoning a lesson half way through.
    - Sends you an amazon gift after completing a mod_data entry (just kidding).
  - Potential uses linked to the predictive models using the analytics API.
