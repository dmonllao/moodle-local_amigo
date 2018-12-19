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

$settings = new admin_settingpage('localamigo', get_string('pluginname', 'local_amigo'));
$ADMIN->add('localplugins', $settings);

if ($hassiteconfig && $ADMIN->fulltree) {

    // General on / off.
    $item = new admin_setting_configcheckbox('local_amigo/enabled',
         new lang_string('enabled', 'local_amigo'),
         new lang_string('enabled_help', 'local_amigo'),
         1);
    $settings->add($item);

    // Rest.
    $settings->add(new admin_setting_heading('rest', get_string('rest', 'local_amigo'), get_string('rest_help', 'local_amigo')));
    $settings->add(new admin_setting_configcheckbox('local_amigo/restenabled',
         new lang_string('enabled', 'local_amigo'), '', 1));

    // Return to studies.
    $settings->add(new admin_setting_heading('returnstudies', get_string('returnstudies', 'local_amigo'), get_string('returnstudies_help', 'local_amigo')));
    $settings->add(new admin_setting_configcheckbox('local_amigo/returnstudiesenabled',
         new lang_string('enabled', 'local_amigo'), '', 1));

    // Greetings.
    $settings->add(new admin_setting_heading('greetings', get_string('greetings', 'local_amigo'), get_string('greetings_help', 'local_amigo')));
    $settings->add(new admin_setting_configcheckbox('local_amigo/greetingsenabled',
         new lang_string('enabled', 'local_amigo'), '', 1));
}
