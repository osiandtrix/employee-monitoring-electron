<template>
  <el-dialog
    :title="'Timesheet'"
    :visible="showModal"
    class="inactivity-dialog"
    width="85%"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  > 
    <template v-if="!success" >
      <div class="timer">
        <p>Enter Today's task details</p>
        <textarea v-model="timesheetData" rows="10" ></textarea>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <template>
          <el-button
            :disabled="disabled"
            type="primary"
            @click="close"
          >
            {{ $t("CANCEL") }}
          </el-button>
          <el-button
            :disabled="timesheetData.trim().length === 0 || disabled"
            type="danger"
            @click="submitSheet"
          >SUBMIT</el-button>
        </template>
      </span>
    </template>

    <template v-else >
      <div class="timer">
        <p>TimeSheet Submitted successfully.</p>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <template>
          <el-button
            :disabled="disabled"
            type="primary"
            @click="close"
          >
            {{ $t("CLOSE") }}
          </el-button>
        </template>
      </span>
    </template>
  </el-dialog>
</template>

<script>

export default {
  name: 'Timesheet',
  data() {
    return {
      timesheetData: "",
      disabled:  false,
      success: false
    }
  },
  computed: {
    showModal() {
      return this.$store.getters.showTimesheet;

    },
  },

  mounted() {

    this.$ipc.serve('timesheet/submitted-success', () => this.successAfter());

    this.getReport();

  },

  methods: {
    /**
     * Closes & resets this modal parameters
     */
    close() {
      // Hiding modal window
      this.$store.dispatch('showTimesheet', false);
    },

    successAfter() {
      this.success = true;
    },

    async submitSheet() {
      this.disabled = true;
      await this.$store.dispatch('submitTimesheet', { data: this.timesheetData, $ipc: this.$ipc });
      this.disabled = false;
      // this.$store.dispatch('showTimesheet', false);
    },

    async getReport() {

      this.$store.dispatch('showLoader');
      const { body } = await this.$ipc.request('time/daily-report', {});

      // Report buffer contains prepared report
      let buffer = '';

      // Preparing report in human-readable format
      body.projects.forEach(project => {
        // Add project name
        buffer += `${project.name}\n\n`;

        // Add all related tasks
        project.tasks.forEach(task => {

          const hrs = Math.floor(task.trackedTime / 3600);
          const mins = Math.floor((task.trackedTime % 3600) / 60);

          buffer += `${task.name.trim()}${task.url ? ` (${task.url})` : ''}\n${hrs}h ${mins}m\n...\n\n`;

        });

      });

      this.$store.dispatch('hideLoader');

      this.timesheetData = buffer; 

    },
  },
};
</script>

<style lang="scss" scoped>
.inactivity-dialog {
  z-index: 99999;

  .timer {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;

    p {
      font-size: 12px;
    }

    textarea {
      margin: 0px;
      width: 332px;
      height: 140px;
      border: #c3c3c3;
      border-width: 1px;
      border-style: solid;
      resize: none;
    }
  }
}
</style>
