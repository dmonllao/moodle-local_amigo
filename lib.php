<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Add page to admin menu.
 *
 * @package    local_amigo
 * @copyright  David Monllao Olive
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once(__DIR__ . '/locallib.php');

function local_amigo_before_footer() {
    global $PAGE, $CFG, $USER, $SITE;

    if (!isloggedin()) {
        return;
    }

    // At this early development stage let's try to not bother people.
    // if (is_siteadmin()) {
    //     return;
    // }

    $config = get_config('local_amigo');
    if (!$config->enabled) {
        return;
    }

    // Using PHP to get the current time as the user timezone needs to be considered.
    $usertime = new DateTime("now", core_date::get_user_timezone_object());

    // 'time' format is for easy JS compliance.
    $timeinfo = [
        'dayweek' => $usertime->format('w'),
        'hour' => $usertime->format('H'),
        'time' => $usertime->format(DateTime::RFC2822),
    ];

    // TODO Support other components than local_amigo.
    $pokes = local_amigo_all_pokes_list();

    $activepokes = [];
    foreach ($pokes as $poke) {
        $lastpoke = get_user_preferences('local_amigo_last_poke_' . $poke, 0);

        $pokefreq = intval($config->{$poke . 'freq'});

        $now = new \DateTime("now", new \DateTimeZone("UTC"));
        if ($lastpoke + $pokefreq < $now->getTimestamp()) {
            $activepokes[$poke] = true;
        }
    }

    $user = [
        'id' => $USER->id,
        'fullname' => fullname($USER),
        'introshowed' => get_user_preferences('local_amigo_intro', 0),
    ];

    $site = [
        'fullname' => $SITE->fullname,
    ];

    $PAGE->requires->js_call_amd('local_amigo/amigo', 'init', [$activepokes, $config, $timeinfo, $user, $site]);
}

/**
 * Callback to define user preferences.
 *
 * @return array
 */
function local_amigo_user_preferences() {
    $preferences = [];

    foreach (local_amigo_all_pokes_list() as $poke) {
        $preferences['local_amigo_last_poke_' . $poke] = [
            'type' => PARAM_INT,
            'null' => NULL_NOT_ALLOWED,
            'default' => 0,
            'permissioncallback' => function($user, $preferencename) {
                global $USER;
                return $user->id == $USER->id;
            }
        ];
    }

    // The user has seen the intro to local_amigo.
    $preferences['local_amigo_intro'] = [
        'type' => PARAM_INT,
        'null' => NULL_NOT_ALLOWED,
        'default' => 0,
        'permissioncallback' => function($user, $preferencename) {
            global $USER;
            return $user->id == $USER->id;
        }
    ];

    return $preferences;
}