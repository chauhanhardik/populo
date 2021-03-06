define([
    'backbone',
    'teams/js/collections/team',
    'teams/js/collections/team_membership',
    'teams/js/views/topic_teams',
    'teams/js/spec_helpers/team_spec_helpers',
    'common/js/spec_helpers/ajax_helpers'
], function (Backbone, TeamCollection, TeamMembershipCollection, TopicTeamsView, TeamSpecHelpers, AjaxHelpers) {
    'use strict';
    describe('Topic Teams View', function () {
        var createTopicTeamsView = function(options) {
            return new TopicTeamsView({
                el: '.teams-container',
                collection: options.teams || TeamSpecHelpers.createMockTeams(),
                teamMemberships: options.teamMemberships || TeamSpecHelpers.createMockTeamMemberships(),
                showActions: true,
                teamParams: {
                    topicID: 'test-topic',
                    countries: TeamSpecHelpers.testCountries,
                    languages: TeamSpecHelpers.testLanguages
                }
            }).render();
        };

        var verifyActions = function(teamsView, options) {
            if (!options) {
                options = {showActions: true};
            }
            var expectedTitle = 'Are you having trouble finding a team to join?',
                expectedMessage = 'Try browsing all teams or searching team descriptions. If you ' +
                    'still can\'t find a team to join, create a new team in this topic.',
                title = teamsView.$('.title').text().trim(),
                message = teamsView.$('.copy').text().trim();
            if (options.showActions) {
                expect(title).toBe(expectedTitle);
                expect(message).toBe(expectedMessage);
            } else {
                expect(title).not.toBe(expectedTitle);
                expect(message).not.toBe(expectedMessage);
            }
        };

        beforeEach(function () {
            setFixtures('<div class="teams-container"></div>');
        });

        it('can render itself', function () {
            var testTeamData = TeamSpecHelpers.createMockTeamData(1, 5),
                teamsView = createTopicTeamsView({
                    teams: TeamSpecHelpers.createMockTeams(testTeamData),
                    teamMemberships: TeamSpecHelpers.createMockTeamMemberships([])
                });

            expect(teamsView.$('.teams-paging-header').text()).toMatch('Showing 1-5 out of 6 total');

            var footerEl = teamsView.$('.teams-paging-footer');
            expect(footerEl.text()).toMatch('1\\s+out of\\s+\/\\s+2');
            expect(footerEl).not.toHaveClass('hidden');

            TeamSpecHelpers.verifyCards(teamsView, testTeamData);
            verifyActions(teamsView);
        });

        it('can browse all teams', function () {
            var emptyMembership = TeamSpecHelpers.createMockTeamMemberships([]),
                teamsView = createTopicTeamsView({ teamMemberships: emptyMembership });
            spyOn(Backbone.history, 'navigate');
            teamsView.$('a.browse-teams').click();
            expect(Backbone.history.navigate.calls[0].args).toContain('browse');
        });

        it('can search teams', function () {
            var emptyMembership = TeamSpecHelpers.createMockTeamMemberships([]),
                teamsView = createTopicTeamsView({ teamMemberships: emptyMembership });
            spyOn(Backbone.history, 'navigate');
            teamsView.$('a.search-teams').click();
            // TODO! Should be updated once team description search feature is available
            expect(Backbone.history.navigate.calls[0].args).toContain('browse');
        });

        it('can show the create team modal', function () {
            var emptyMembership = TeamSpecHelpers.createMockTeamMemberships([]),
                teamsView = createTopicTeamsView({ teamMemberships: emptyMembership });
            spyOn(Backbone.history, 'navigate');
            teamsView.$('a.create-team').click();
            expect(Backbone.history.navigate.calls[0].args).toContain('topics/test-topic/create-team');
        });

        it('does not show actions for a user already in a team', function () {
            var teamsView = createTopicTeamsView({});
            verifyActions(teamsView, {showActions: false});
        });

        it('shows actions for a privileged user already in a team', function () {
            var staffMembership = TeamSpecHelpers.createMockTeamMemberships(
                    TeamSpecHelpers.createMockTeamMembershipsData(1, 5),
                    { privileged: true }
                ),
                teamsView = createTopicTeamsView({ teamMemberships: staffMembership });
            verifyActions(teamsView);
        });

        it('shows actions for a staff user already in a team', function () {
            var staffMembership = TeamSpecHelpers.createMockTeamMemberships(
                    TeamSpecHelpers.createMockTeamMembershipsData(1, 5),
                    { privileged: false, staff: true }
                ),
                teamsView = createTopicTeamsView({ teamMemberships: staffMembership });
            verifyActions(teamsView);
        });

        /*
        // TODO: make this ready for prime time
        it('refreshes when the team membership changes', function() {
            var requests = AjaxHelpers.requests(this),
                teamMemberships = TeamSpecHelpers.createMockTeamMemberships([]),
                teamsView = createTopicTeamsView({ teamMemberships: teamMemberships });
            verifyActions(teamsView, {showActions: true});
            teamMemberships.teamEvents.trigger('teams:update', { action: 'create' });
            teamsView.render();
            AjaxHelpers.expectJsonRequestURL(
                requests,
                'foo',
                {
                    expand : 'team',
                    username : 'testUser',
                    course_id : 'my/course/id',
                    page : '1',
                    page_size : '10'
                }
            );
            AjaxHelpers.respondWithJson(requests, {});
            verifyActions(teamsView, {showActions: false});
        });
        */
    });
});
