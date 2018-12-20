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
 * Amigo settings.
 *
 * @package    local_amigo
 * @copyright  David Monllao Olive
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once(__DIR__ . '/locallib.php');

$settings = new admin_settingpage('localamigo', get_string('pluginname', 'local_amigo'));
$ADMIN->add('localplugins', $settings);

if ($hassiteconfig && $ADMIN->fulltree) {

    // General on / off.
    $item = new admin_setting_configcheckbox('local_amigo/enabled',
         new lang_string('enabled', 'local_amigo'),
         new lang_string('enabled_help', 'local_amigo'),
         1);
    $settings->add($item);

    // Hardcoded pokes list.
    $pokes = local_amigo_all_pokes_list();

    // Enabled pokes.
    $settings->add(new admin_setting_heading('enabledpokes', get_string('enabledpokes', 'local_amigo'), ''));
    foreach ($pokes as $poke) {
        $settings->add(new admin_setting_configcheckbox('local_amigo/' . $poke . 'enabled',
             new lang_string($poke, 'local_amigo'),
             new lang_string($poke . '_help', 'local_amigo'), 1));
    }

    // Frequency.
    $settings->add(new admin_setting_heading('freqpokes', get_string('freqpokes', 'local_amigo'), get_string('freqpokes_help', 'local_amigo')));
    foreach ($pokes as $poke) {

        // Default to every 2 days.
        $settings->add(new admin_setting_configduration('local_amigo/' . $poke . 'freq',
             new lang_string($poke, 'local_amigo'), '', 172800, PARAM_INT));
    }

    // Specific settings.
}
