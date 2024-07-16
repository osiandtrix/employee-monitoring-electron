<template>
  <div class="tracker">
    <el-row class="task">
      <el-col
        :type="'flex'"
        :span="18"
      >
        <div class="task-info-row">
          <div>
            <el-button
              type="text"
              icon="el-icon-files"
              size="medium"
              @click="openIntervalsQueue"
            />
          </div>
          <div class="task-info-row">
            <div class="task-info">
              <p
                class="task-name"
              >
                Total Time
              </p>
              <p
                class="tracker-toggler"
              >
                {{ trackedTime }}
              </p>
            </div>
            <div  class="task-info">
              <p
                class="task-name"
              >
                Idle Time
              </p>
              <p
                class="tracker-toggler"
              >
                00:00:00
                <!-- {{ trackedTime }} -->
              </p>
            </div>
            <div  class="task-info">
              <p
                class="task-name"
              >
                Actual Time
              </p>
              <p
                class="tracker-toggler"
              >
                {{ trackedTime }}
            </p>
            </div>
          </div>
          <!-- <template v-if="trackingTask">
            <p
              class="task-name clickable"
              @click="openTask"
            >
              {{ trackingTask.name }}
            </p>
            <p
              class="project-name clickable"
              @click="openProject"
            >
              {{ projectName }}
            </p>
          </template>
          <template v-else>
            <p class="task-name">
              {{ $t('On pause') }}
            </p>
          </template> -->
        </div>
      </el-col>
      <el-col
        class="tracker-controls"
        :span="6"
      >
        <p
          @click="openTimesheet"
          class="task-name clickable">
          Time Sheet
        </p>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { clipboard } from 'electron';

export default {
  name: 'Tracker',
  components: {},
  props: {
    isTrackerLoading: Boolean,
  },
  data() {

    return {
      errorModal: false,
      reportSnack: false,
      trackButtonLocked: false,
    };

  },
  computed: {

    trackingLoad() {

      return this.$store.getters.trackLoad;

    },

    trackingInProgress() {

      return this.$store.getters.trackStatus;

    },

    trackingTask() {

      if (!this.$store.getters.task)
        return false;


      return this.getTask(this.$store.getters.task);

    },

    trackedTime() {
      const { totalTime } = this.$store.getters;
      return new Date(totalTime * 1000).toISOString().substr(11, 8);

    },

    projectName() {

      if (this.trackingTask.Project === null) {
        
        return '';
      
      }

      return this.trackingTask.Project.name;

    }

  },

  // mounted() {

  //   this.$ipc.serve('inactivity-modal/resume-work-after-inactivity', async () => {

  //     await this.track();

  //   });
  // },

  methods: {

    /**
     * Opens intervals queue
     */
    openIntervalsQueue() {

      console.log('this.$store.getters =====>');
      console.log('this.$store.getters',this.$store.getters);

      this.$emit('load-task-position', null);

      // Make this button acting as "toggle" between intervals and main pages
      if (this.$route.name === 'user.intervalsQueue') {

        this.$router.push({ name: 'user.tasks' });
        return;

      }

      this.$router.push({ name: 'user.intervalsQueue' });

    },

    async resumeTracking() {

      if (!this.$store.getters.task || this.$store.getters.trackStatus)
        await this.$store.dispatch('stopTrack', { $ipc: this.$ipc });
      else
        await this.$store.dispatch('startTrack', { taskId: this.$store.getters.task, $ipc: this.$ipc });

    },

    async getReport() {

      this.$store.dispatch('showLoader');
      const { body } = await this.$ipc.request('time/daily-report', {});

      // Report buffer contains prepared report
      let reportBuffer = '';

      body.projects.forEach(project => {

        // Add project name
        reportBuffer += `**${project.name}**\n\n`;

        // Add all related tasks
        project.tasks.forEach(task => {

          reportBuffer += `_${task.name.trim()}${task.url ? ` (${task.url})` : ''}_\n...\n\n`;

        });

      });

      this.$store.dispatch('hideLoader');

      clipboard.writeText(reportBuffer);
      this.reportSnack = true;

    },

    // Open Timesheet Submission
    async openTimesheet() {
      await this.$store.dispatch('showTimesheet', true);
      console.log('this.$store.getters.showTimesheet',this.$store.getters.showTimesheet);
    }

  },
};
</script>

<style lang="scss" scoped>
  @import "../../../../scss/imports/variables";
  @import "../../../../scss/misc/tasks-style-misc";

  p {
    margin: 0;
  }

  .tracker {
    padding: 1em 1.5em;
    background-color: $--background-color-base;
    border-top: $--border-base;
    height: 40px;
    max-height: 40px;
    justify-content: center;
    display: flex;
    flex-direction: column;

    .task {
      padding: 0;
      display: flex;
      align-items: center;
      background-color: inherit;

      .task-info-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      .task-info {
        max-width: inherit;
        padding: 0;
        margin-right: 20px;
        
        p:last-of-type {
          margin: 0;
        }
      }

      .tracker-controls {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
      }

      .tracker-toggler {
          font-size: 12px;
          padding: 12px 0;
          display: flex;
          align-items: center;
          text-align: center;
        }
    }

    p.task-name {
      text-align: center;
      font-size: 13px;
    }
  }

  .el-button.sync {
    padding: 12px 20px;
  }

</style>
